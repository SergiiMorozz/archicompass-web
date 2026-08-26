import { GeminiProvider } from "@/lib/ai/gemini-provider";
import { designerAnalysisPromptVersion } from "@/lib/ai/designer-analysis-schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logError, logInfo } from "@/lib/observability";
import {
  classifyDiscoveredPageType,
  discoverPortfolioPages,
  downloadPortfolioImage,
  fetchAndExtractImageRefs,
  galleryChildLinks,
  type DiscoveredPageType,
} from "./website-adapter";
import { mergeContactFacts } from "./contact-extractor";
import { clusterAssets, parseProjectTitleFacts, type ProposedCluster } from "./clustering";
import { aggregateDesignerProfile } from "./aggregate-profile";
import { maxAssetsDiscoveredPerJob } from "./types";
import { extensionFor, stagingBucket, type PortfolioImportJob, type SupabaseServerClient } from "./job-access";
import { type SiteLocale } from "@/lib/site-locale";
import { serviceCapabilities } from "@/lib/service-capabilities";
import { visuallyInferableServiceCapabilities } from "@/lib/ai/profile-draft-schema";

// Download a small batch concurrently. This keeps a large portfolio moving
// without creating an unbounded number of remote requests in one advance.
const downloadBatchSize = 6;
// AI cost is controlled per-project, not by a shared job-wide counter - a
// large gallery discovered early must never be the reason a project
// discovered later gets no AI analysis at all.
const maxImagesPerAnalysis = 12;
const maxTotalCrawledPages = 50;
const oversizedClusterThreshold = 10;
const lowConfidenceThreshold = 0.4;

function localeForJob(job: PortfolioImportJob): SiteLocale {
  return job.locale === "en" ? "en" : "pl";
}

async function trackEvent(actorId: string, eventType: string, entityId: string, metadata: Record<string, unknown> = {}) {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("product_events").insert({ event_type: eventType, actor_id: actorId, entity_id: entityId, metadata });
  } catch {
    logError("portfolio_import_metric_write_failed", { eventType, entityId });
  }
}

function sampleEvenly<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const step = items.length / count;
  const sampled: T[] = [];
  for (let i = 0; i < count; i++) sampled.push(items[Math.floor(i * step)]);
  return sampled;
}

async function fail(supabase: SupabaseServerClient, job: PortfolioImportJob, message: string) {
  await supabase.from("portfolio_import_jobs").update({ status: "FAILED", error: message }).eq("id", job.id);
  await trackEvent(job.user_id, "portfolio_import_failed", job.id, { reason: message, stage: job.status });
  return { ...job, status: "FAILED" as const, error: message };
}

async function stepQueued(supabase: SupabaseServerClient, job: PortfolioImportJob) {
  if (!job.source_url) return fail(supabase, job, "Missing source URL.");

  let discovered;
  try {
    discovered = await discoverPortfolioPages(job.source_url);
  } catch (reason) {
    return fail(supabase, job, reason instanceof Error ? reason.message : "Could not fetch that page.");
  }
  if (!discovered.pages.length) return fail(supabase, job, "We could not reach that page.");

  const { error: insertError } = await supabase.from("portfolio_import_pages").insert(
    discovered.pages.map((pageUrl, index) => ({
      job_id: job.id,
      page_url: pageUrl,
      page_type: classifyDiscoveredPageType(pageUrl, index === 0),
    }))
  );
  if (insertError) return fail(supabase, job, "Could not save the pages to crawl.");

  const { data, error } = await supabase
    .from("portfolio_import_jobs")
    .update({
      status: "FETCHING",
      discovered_social_links: discovered.socialLinks,
      discovered_contact_facts: discovered.contactFacts,
    })
    .eq("id", job.id)
    .select("*")
    .single();
  if (error || !data) return fail(supabase, job, "Could not update the import job.");
  return data as PortfolioImportJob;
}

async function stepFetching(supabase: SupabaseServerClient, job: PortfolioImportJob) {
  const { count: totalAssets } = await supabase
    .from("portfolio_assets")
    .select("id", { count: "exact", head: true })
    .eq("job_id", job.id);
  const overBudget = (totalAssets ?? 0) >= maxAssetsDiscoveredPerJob;

  const { data: pendingPages, error: pendingError } = await supabase
    .from("portfolio_import_pages")
    .select("id, page_url")
    .eq("job_id", job.id)
    .eq("status", "pending")
    .limit(1);
  if (pendingError) return fail(supabase, job, "Could not read the page crawl queue.");

  const nextPage = pendingPages?.[0];
  if (nextPage) {
    if (overBudget) {
      await supabase.from("portfolio_import_pages").update({ status: "failed", error: "Photo budget reached" }).eq("id", nextPage.id);
    } else {
      try {
        const extracted = await fetchAndExtractImageRefs(nextPage.page_url);
        const mergedContactFacts = mergeContactFacts(job.discovered_contact_facts ?? {}, extracted.contactFacts);
        await supabase.from("portfolio_import_jobs").update({ discovered_contact_facts: mergedContactFacts }).eq("id", job.id);
        job = { ...job, discovered_contact_facts: mergedContactFacts };

        const children = galleryChildLinks(extracted.finalUrl, extracted.links);

        // A page with several deeper sub-pages under its own path (e.g.
        // /realizacje/ linking to /realizacje/apartament-a/, .../apartament-b/)
        // is a gallery index, not one project - crawl its children instead of
        // treating its own thumbnails as a single giant project. Dedicated
        // per-project URLs are the strongest structural signal there is: a
        // page with 3+ same-path children is treated as an index regardless
        // of how many (if any) images it has of its own - an index page
        // commonly has FEWER own images than it has project cards (its
        // thumbnails are often lazy-loaded or CSS backgrounds we can't see),
        // so requiring the opposite was the actual bug, not a safety check.
        if (children.length >= 3) {
          // Confirmed as an index now that it's actually been fetched - its
          // own thumbnails were never turned into a project (see the `else`
          // below), and its children are structurally proven project pages.
          await supabase.from("portfolio_import_pages").update({ page_type: "portfolio_index" }).eq("id", nextPage.id);
          const { count: queuedPages } = await supabase
            .from("portfolio_import_pages")
            .select("id", { count: "exact", head: true })
            .eq("job_id", job.id);
          const { data: existingPages } = await supabase
            .from("portfolio_import_pages")
            .select("page_url")
            .eq("job_id", job.id);
          const alreadyQueued = new Set((existingPages ?? []).map((row) => row.page_url));
          const room = Math.max(0, maxTotalCrawledPages - (queuedPages ?? 0));
          const toEnqueue = children.filter((link) => !alreadyQueued.has(link)).slice(0, room);
          if (toEnqueue.length) {
            await supabase.from("portfolio_import_pages").insert(
              toEnqueue.map((pageUrl) => ({ job_id: job.id, page_url: pageUrl, page_type: "portfolio_project_detail" as const }))
            );
          }
        } else if (extracted.refs.length) {
          await supabase.from("portfolio_assets").insert(
            extracted.refs.map((ref) => ({
              job_id: job.id,
              source_page_url: extracted.finalUrl,
              source_image_url: ref.src,
              page_title: extracted.pageTitle,
              alt_text: ref.alt,
            }))
          );
          await supabase
            .from("portfolio_import_pages")
            .update({ original_description: extracted.originalDescription })
            .eq("id", nextPage.id);
        }
        await supabase.from("portfolio_import_pages").update({ status: "done" }).eq("id", nextPage.id);
      } catch (reason) {
        await supabase
          .from("portfolio_import_pages")
          .update({ status: "failed", error: reason instanceof Error ? reason.message : "Could not fetch this page." })
          .eq("id", nextPage.id);
      }
    }

    // Crawling a larger website spans several advances. Keep a heartbeat on
    // every completed page so the UI only calls it stalled when no work is
    // actually happening.
    const { data, error } = await supabase
      .from("portfolio_import_jobs")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", job.id)
      .select("*")
      .single();
    if (error || !data) return fail(supabase, job, "Could not update import progress.");
    return data as PortfolioImportJob;
  }

  const { count: imagesFound } = await supabase
    .from("portfolio_assets")
    .select("id", { count: "exact", head: true })
    .eq("job_id", job.id);
  if (!imagesFound) return fail(supabase, job, "We could not find any photos on that site.");

  const { data, error } = await supabase
    .from("portfolio_import_jobs")
    .update({ status: "EXTRACTING", images_found: imagesFound })
    .eq("id", job.id)
    .select("*")
    .single();
  if (error || !data) return fail(supabase, job, "Could not update the import job.");
  return data as PortfolioImportJob;
}

async function stepExtracting(supabase: SupabaseServerClient, job: PortfolioImportJob) {
  const { data: pending, error: pendingError } = await supabase
    .from("portfolio_assets")
    .select("id, source_image_url, source_page_url, page_title, alt_text")
    .eq("job_id", job.id)
    .is("storage_path", null)
    .limit(downloadBatchSize);
  if (pendingError) return fail(supabase, job, "Could not read the pending photo queue.");

  await Promise.all(
    (pending ?? []).map(async (asset) => {
      if (!asset.source_image_url) {
        await supabase.from("portfolio_assets").delete().eq("id", asset.id);
        return;
      }

      const candidate = await downloadPortfolioImage(
        { src: asset.source_image_url, alt: asset.alt_text },
        asset.source_page_url ?? job.source_url ?? asset.source_image_url,
        asset.page_title
      );
      if (!candidate) {
        await supabase.from("portfolio_assets").delete().eq("id", asset.id);
        return;
      }

      const path = `${job.user_id}/${job.id}/${asset.id}.${extensionFor(candidate.contentType)}`;
      const { error: uploadError } = await supabase.storage
        .from(stagingBucket)
        .upload(path, candidate.bytes, { contentType: candidate.contentType, upsert: true });
      if (uploadError) {
        await supabase.from("portfolio_assets").delete().eq("id", asset.id);
        return;
      }

      await supabase
        .from("portfolio_assets")
        .update({ storage_path: path, content_hash: candidate.contentHash })
        .eq("id", asset.id);
    })
  );

  const { count: remaining } = await supabase
    .from("portfolio_assets")
    .select("id", { count: "exact", head: true })
    .eq("job_id", job.id)
    .is("storage_path", null);

  if (remaining && remaining > 0) {
    // A batch may take a while on a portfolio with remote images. Persist a
    // heartbeat so the browser can distinguish useful work from a stalled job.
    const { data, error } = await supabase
      .from("portfolio_import_jobs")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", job.id)
      .select("*")
      .single();
    if (error || !data) return fail(supabase, job, "Could not update import progress.");
    return data as PortfolioImportJob;
  }

  const { count: downloaded } = await supabase
    .from("portfolio_assets")
    .select("id", { count: "exact", head: true })
    .eq("job_id", job.id)
    .not("storage_path", "is", null);

  if (!downloaded) return fail(supabase, job, "None of the discovered photos could be downloaded.");

  const { data, error } = await supabase
    .from("portfolio_import_jobs")
    .update({ status: "GROUPING", images_found: downloaded })
    .eq("id", job.id)
    .select("*")
    .single();
  if (error || !data) return fail(supabase, job, "Could not update the import job.");
  return data as PortfolioImportJob;
}

/**
 * Large, low-confidence clusters (a flat gallery page with many images and no
 * structural way to tell projects apart) get one extra AI pass: send the
 * images to the model and ask it to propose a visual grouping. This only
 * fires for clusters that already failed the cheap structural signals, and
 * its output is surfaced as medium confidence, not treated as ground truth -
 * on any failure or an unconvincing result we fall back to the original
 * single cluster rather than guessing.
 */
async function refineOversizedCluster(
  supabase: SupabaseServerClient,
  cluster: ProposedCluster,
  assetById: Map<string, { storagePath: string | null }>,
  locale: SiteLocale
): Promise<ProposedCluster[]> {
  if (cluster.assetIds.length < oversizedClusterThreshold || cluster.confidence > lowConfidenceThreshold) {
    return [cluster];
  }

  const images: { base64: string; mimeType: string }[] = [];
  const orderedAssetIds: string[] = [];
  for (const assetId of cluster.assetIds) {
    const storagePath = assetById.get(assetId)?.storagePath;
    if (!storagePath) continue;
    const { data: file } = await supabase.storage.from(stagingBucket).download(storagePath);
    if (!file) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    images.push({ base64: buffer.toString("base64"), mimeType: file.type || "image/jpeg" });
    orderedAssetIds.push(assetId);
  }
  if (!images.length) return [cluster];

  const provider = new GeminiProvider();
  const response = await provider.suggestSubclusters({ images, locale });
  if (!response.ok || response.result.groups.length < 2) return [cluster];

  const covered = new Set<number>();
  const subclusters: ProposedCluster[] = [];
  for (const group of response.result.groups) {
    const assetIds = group.imageIndexes.map((index) => orderedAssetIds[index]).filter((id): id is string => Boolean(id));
    if (!assetIds.length) continue;
    group.imageIndexes.forEach((index) => covered.add(index));
    subclusters.push({ assetIds, suggestedTitle: group.label, originalTitle: null, confidence: 0.5 });
  }
  if (subclusters.length < 2) return [cluster];

  // Any image the model didn't place in a group (a truncated batch, or a
  // gap in its response) still needs a home - fold it into the largest
  // proposed group rather than silently dropping it from the project.
  const leftover = cluster.assetIds.filter((id) => !subclusters.some((group) => group.assetIds.includes(id)));
  if (leftover.length) {
    const largest = subclusters.reduce((a, b) => (a.assetIds.length >= b.assetIds.length ? a : b));
    largest.assetIds.push(...leftover);
  }

  return subclusters;
}

async function stepGrouping(supabase: SupabaseServerClient, job: PortfolioImportJob) {
  const { data: allAssets, error: assetsError } = await supabase
    .from("portfolio_assets")
    .select("id, source_page_url, page_title, content_hash, storage_path")
    .eq("job_id", job.id)
    .not("storage_path", "is", null);
  if (assetsError) return fail(supabase, job, "Could not read the downloaded photos.");
  if (!allAssets?.length) return fail(supabase, job, "No photos are available to group into projects.");

  const { data: pages } = await supabase
    .from("portfolio_import_pages")
    .select("page_url, page_type, original_description")
    .eq("job_id", job.id);
  const pageTypeByUrl = new Map<string, DiscoveredPageType | "portfolio_project_detail">(
    (pages ?? []).map((page) => [page.page_url, page.page_type as DiscoveredPageType | "portfolio_project_detail"])
  );
  const pageDescriptionByUrl = new Map<string, string | null>((pages ?? []).map((page) => [page.page_url, page.original_description]));

  // Dedicated project/album detail pages are the strongest boundary evidence
  // a structured portfolio site can offer - when a site has them, an
  // about/services/homepage page that incidentally shows interior photos
  // must not compete with them as an independent project (source priority:
  // portfolio_project_detail > everything else). Sites with no such
  // structure (a flat gallery, or manual uploads with no source pages at
  // all) fall back to the previous "every page/page-view is a candidate"
  // behavior, since there's no stronger signal available for them.
  const hasDedicatedProjectPages = allAssets.some(
    (asset) => asset.source_page_url && pageTypeByUrl.get(asset.source_page_url) === "portfolio_project_detail"
  );
  const assets = hasDedicatedProjectPages
    ? allAssets.filter((asset) => !asset.source_page_url || pageTypeByUrl.get(asset.source_page_url) === "portfolio_project_detail")
    : allAssets;
  if (!assets.length) return fail(supabase, job, "No photos are available to group into projects.");

  // Images whose content repeats across multiple crawled pages are almost
  // certainly shared site chrome (logo, nav icon, footer badge), not
  // portfolio photography - deselect them by default rather than deleting
  // them, so a wrong guess is still correctable in review.
  const pagesByHash = new Map<string, Set<string>>();
  for (const asset of assets) {
    if (!asset.content_hash || !asset.source_page_url) continue;
    const pages = pagesByHash.get(asset.content_hash) ?? new Set<string>();
    pages.add(asset.source_page_url);
    pagesByHash.set(asset.content_hash, pages);
  }
  const duplicateHashes = new Set(
    Array.from(pagesByHash.entries())
      .filter(([, pages]) => pages.size >= 2)
      .map(([hash]) => hash)
  );
  const duplicateAssetIds = new Set(
    assets.filter((asset) => asset.content_hash && duplicateHashes.has(asset.content_hash)).map((asset) => asset.id)
  );
  if (duplicateAssetIds.size) {
    await supabase.from("portfolio_assets").update({ selected: false }).in("id", Array.from(duplicateAssetIds));
  }

  // Drop clusters whose every image turned out to be a shared/duplicate
  // asset (e.g. a nav-only page with just the logo) - not a real project.
  const pageClusters = clusterAssets(assets).filter((cluster) => cluster.assetIds.some((id) => !duplicateAssetIds.has(id)));
  if (!pageClusters.length) return fail(supabase, job, "We could not find distinct projects on that site.");

  const assetById = new Map(assets.map((asset) => [asset.id, { storagePath: asset.storage_path }]));
  const sourcePageByAssetId = new Map(assets.map((asset) => [asset.id, asset.source_page_url]));
  const clusters: ProposedCluster[] = [];
  for (const cluster of pageClusters) {
    // A dedicated project/album page is a locked boundary: a big, visually
    // varied gallery (a house with six rooms) is still one project, and
    // AI room-clustering must not be allowed to split it into several. That
    // refinement pass only makes sense for the fallback case - a flat
    // gallery/upload with no page structure to tell projects apart.
    const refined = hasDedicatedProjectPages
      ? [cluster]
      : await refineOversizedCluster(supabase, cluster, assetById, localeForJob(job));
    clusters.push(...refined);
  }

  for (const cluster of clusters) {
    // Source facts (object type, area, location, stage, the page's own
    // description) come only from the page itself, never from AI - and only
    // apply when this cluster genuinely is one dedicated page, not an AI
    // room-subcluster carved out of a larger page (those have no single
    // source page of their own to attribute facts to).
    const sourcePageUrl = sourcePageByAssetId.get(cluster.assetIds[0]) ?? null;
    const titleFacts = parseProjectTitleFacts(cluster.originalTitle);
    const originalDescription = sourcePageUrl ? pageDescriptionByUrl.get(sourcePageUrl) ?? null : null;

    const { data: project, error: projectError } = await supabase
      .from("portfolio_projects")
      .insert({
        job_id: job.id,
        suggested_title: cluster.suggestedTitle,
        original_title: cluster.originalTitle,
        confidence: cluster.confidence,
        object_type: titleFacts.objectType,
        area_m2: titleFacts.areaM2,
        location: titleFacts.location,
        project_stage: titleFacts.projectStage,
        original_description: originalDescription,
      })
      .select("id")
      .single();
    if (projectError || !project) continue;

    await supabase
      .from("portfolio_assets")
      .update({ cluster_project_id: project.id })
      .in("id", cluster.assetIds);

    const coverAssetId = cluster.assetIds.find((id) => !duplicateAssetIds.has(id)) ?? cluster.assetIds[0];
    await supabase
      .from("portfolio_projects")
      .update({ cover_asset_id: coverAssetId })
      .eq("id", project.id);
  }

  const { data, error } = await supabase
    .from("portfolio_import_jobs")
    .update({ status: "ANALYZING", projects_found: clusters.length })
    .eq("id", job.id)
    .select("*")
    .single();
  if (error || !data) return fail(supabase, job, "Could not update the import job.");
  return data as PortfolioImportJob;
}

async function stepAnalyzing(supabase: SupabaseServerClient, job: PortfolioImportJob) {
  const { data: projects, error: projectsError } = await supabase
    .from("portfolio_projects")
    .select("id, suggested_title, original_title, project_ai_analysis(status)")
    .eq("job_id", job.id);
  if (projectsError) return fail(supabase, job, "Could not read the project list.");

  const pendingProject = (projects ?? []).find((project) => {
    const analysis = Array.isArray(project.project_ai_analysis) ? project.project_ai_analysis[0] : project.project_ai_analysis;
    return !analysis;
  });

  if (pendingProject) {
    const { data: allSelectedAssets } = await supabase
      .from("portfolio_assets")
      .select("storage_path")
      .eq("cluster_project_id", pendingProject.id)
      .eq("selected", true)
      .not("storage_path", "is", null)
      .order("discovered_at", { ascending: true });
    // A large gallery's first N images are often near-duplicate hero shots
    // of the same room - an even spread across the whole gallery gives
    // Gemini a much better sample of the project than the first few photos
    // discovered, without needing full visual-similarity clustering.
    const assets = sampleEvenly(allSelectedAssets ?? [], maxImagesPerAnalysis);

    const images = [];
    for (const asset of assets ?? []) {
      if (!asset.storage_path) continue;
      const { data: file } = await supabase.storage.from(stagingBucket).download(asset.storage_path);
      if (!file) continue;
      const buffer = Buffer.from(await file.arrayBuffer());
      images.push({ base64: buffer.toString("base64"), mimeType: file.type || "image/jpeg" });
    }

    const provider = new GeminiProvider();
    if (!images.length) {
      await supabase.from("project_ai_analysis").upsert(
        {
          portfolio_project_id: pendingProject.id,
          model: provider.name,
          model_version: provider.modelVersion,
          prompt_version: designerAnalysisPromptVersion,
          status: "failed",
          error: "No images available for this project.",
        },
        { onConflict: "portfolio_project_id" }
      );
    } else {
      const response = await provider.analyzeDesignerProject({
        images,
        projectTitle: pendingProject.suggested_title,
        locale: localeForJob(job),
      });
      await supabase.from("project_ai_analysis").upsert(
        {
          portfolio_project_id: pendingProject.id,
          model: provider.name,
          model_version: provider.modelVersion,
          prompt_version: designerAnalysisPromptVersion,
          result: response.ok ? response.result : null,
          status: response.ok ? "done" : "failed",
          error: response.ok ? null : response.error,
        },
        { onConflict: "portfolio_project_id" }
      );
      if (response.ok) {
        const projectPatch: Record<string, unknown> = {};
        if (response.result.suggestedTitle) {
          // The AI's title is a separate, clearly-labeled layer - it must
          // never clobber a real source-page title. Only when there was no
          // genuine source title to protect (manual upload, untitled page)
          // does it still become the primary display title, same as before.
          projectPatch.ai_title = response.result.suggestedTitle;
          if (!pendingProject.original_title) projectPatch.suggested_title = response.result.suggestedTitle;
        }
        // Not an interior project (portrait, logo, moodboard, award, office
        // shot, etc.) - hide it by default so it doesn't pollute the public
        // portfolio or the Designer DNA. Still fully visible/reversible in
        // review, since this is a judgment call the designer can override.
        if (!response.result.isInteriorProject) projectPatch.status = "hidden";
        if (Object.keys(projectPatch).length) {
          await supabase.from("portfolio_projects").update(projectPatch).eq("id", pendingProject.id);
        }
        await trackEvent(job.user_id, "ai_analysis_completed", pendingProject.id, {
          photo_count: images.length,
          provider: provider.name,
          is_interior_project: response.result.isInteriorProject,
        });
      }
      logInfo("portfolio_project_analyzed", { jobId: job.id, projectId: pendingProject.id, ok: response.ok });
    }

    const { data } = await supabase.from("portfolio_import_jobs").select("*").eq("id", job.id).single();
    return (data as PortfolioImportJob) ?? job;
  }

  const { data, error } = await supabase
    .from("portfolio_import_jobs")
    .update({ status: "BUILDING_PROFILE" })
    .eq("id", job.id)
    .select("*")
    .single();
  if (error || !data) return fail(supabase, job, "Could not update the import job.");
  return data as PortfolioImportJob;
}

async function stepBuildingProfile(supabase: SupabaseServerClient, job: PortfolioImportJob) {
  const { data: rows, error } = await supabase
    .from("project_ai_analysis")
    .select("result, portfolio_projects!inner(id, job_id, status)")
    .eq("status", "done")
    .eq("portfolio_projects.job_id", job.id);
  if (error) return fail(supabase, job, "Could not read the project analyses.");

  // A project hidden (by the designer or by the "not interior" auto-hide)
  // must not still shape the Designer DNA - and a project whose only image
  // was later removed (e.g. via the review-step delete button) has nothing
  // left to be evidence of.
  const visibleRows = (rows ?? []).filter((row) => {
    const project = Array.isArray(row.portfolio_projects) ? row.portfolio_projects[0] : row.portfolio_projects;
    return project?.status !== "hidden";
  });
  const projectIds = visibleRows
    .map((row) => (Array.isArray(row.portfolio_projects) ? row.portfolio_projects[0] : row.portfolio_projects)?.id)
    .filter((id): id is string => Boolean(id));
  const { data: selectedAssets } = projectIds.length
    ? await supabase.from("portfolio_assets").select("cluster_project_id").in("cluster_project_id", projectIds).eq("selected", true)
    : { data: [] as { cluster_project_id: string | null }[] };
  const projectsWithAssets = new Set((selectedAssets ?? []).map((asset) => asset.cluster_project_id));

  const analyses = visibleRows
    .filter((row) => {
      const project = Array.isArray(row.portfolio_projects) ? row.portfolio_projects[0] : row.portfolio_projects;
      return project?.id ? projectsWithAssets.has(project.id) : false;
    })
    .map((row) => row.result as { isInteriorProject?: boolean; summary?: string } | null)
    .filter((result): result is NonNullable<typeof result> => Boolean(result) && result?.isInteriorProject !== false);
  const profile = aggregateDesignerProfile(analyses as never);

  await supabase.from("designer_intelligence_profiles").upsert(
    { user_id: job.user_id, ...profile, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );

  {
    const social = job.discovered_social_links ?? {};
    const contact = job.discovered_contact_facts ?? {};
    const draftPayload: Record<string, unknown> = {
      job_id: job.id,
      instagram_url: social.instagram ?? null,
      facebook_url: social.facebook ?? null,
      behance_url: social.behance ?? null,
      linkedin_url: social.linkedin ?? null,
      full_name: contact.fullName ?? null,
      location: contact.location ?? null,
      phone: contact.phone ?? null,
      email: contact.email ?? null,
      languages: contact.languages ?? [],
      work_modes: contact.workModes ?? [],
      explicit_service_capabilities: contact.explicitServiceCapabilities ?? [],
    };

    if (profile.project_count > 0) {
      const summaries = analyses.map((analysis) => analysis.summary).filter((summary): summary is string => Boolean(summary));
      const provider = new GeminiProvider();
      const draftResponse = await provider.suggestProfileDraft({
        profile,
        projectSummaries: summaries,
        allowedServiceCapabilities: visuallyInferableServiceCapabilities(serviceCapabilities),
        locale: localeForJob(job),
      });
      if (draftResponse.ok) {
        draftPayload.headline = draftResponse.result.headline || null;
        draftPayload.about = draftResponse.result.about || null;
        draftPayload.specialties = draftResponse.result.specialties;
        // Text found explicitly on the site is a stronger signal than a
        // guess from photos - union it in rather than letting the AI's
        // narrower (visually-inferable-only) list crowd it out.
        draftPayload.suggested_service_capabilities = Array.from(
          new Set([...draftResponse.result.suggestedServiceCapabilities, ...(contact.explicitServiceCapabilities ?? [])])
        );
      } else {
        logError("profile_draft_generation_failed", { jobId: job.id, error: draftResponse.error });
      }
    }

    await supabase.from("portfolio_profile_drafts").upsert(draftPayload, { onConflict: "job_id" });
  }

  await trackEvent(job.user_id, "profile_ai_generated", job.id, { project_count: profile.project_count });

  const { data, error: updateError } = await supabase
    .from("portfolio_import_jobs")
    .update({ status: "READY_FOR_REVIEW" })
    .eq("id", job.id)
    .select("*")
    .single();
  if (updateError || !data) return fail(supabase, job, "Could not update the import job.");
  await trackEvent(job.user_id, "portfolio_import_completed", job.id, {});
  return data as PortfolioImportJob;
}

/** Executes exactly one bounded unit of work and returns the job's new state. Safe to call repeatedly (a client-driven step loop) until status is a terminal one. */
export async function advancePortfolioImportJob(supabase: SupabaseServerClient, job: PortfolioImportJob) {
  switch (job.status) {
    case "QUEUED":
      return stepQueued(supabase, job);
    case "FETCHING":
      return stepFetching(supabase, job);
    case "EXTRACTING":
      return stepExtracting(supabase, job);
    case "GROUPING":
      return stepGrouping(supabase, job);
    case "ANALYZING":
      return stepAnalyzing(supabase, job);
    case "BUILDING_PROFILE":
      return stepBuildingProfile(supabase, job);
    default:
      return job;
  }
}
