import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProjectGallery from "@/components/ProjectGallery";

export const revalidate = 0;

type Project = {
  id: string;
  title: string | null;
  category: string | null;
  description: string | null;
  project_url: string | null;
  image_url: string | null;
  image_path: string | null;
  image_urls: string[] | null;
  image_paths: string[] | null;
  created_at: string;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

const fieldClass =
  "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal text-foreground outline-none transition focus:border-primary";
const areaClass =
  "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal text-foreground outline-none transition focus:border-primary";
const fileClass =
  "mt-2 w-full rounded-xl border border-dashed border-line bg-background px-4 py-4 text-sm font-normal text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white";
const projectImagesBucket = "project-images";
const maxImageSize = 10 * 1024 * 1024;
const maxProjectImages = 12;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const fallbackImages = [
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
];

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function urlValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  if (!value || value === "https://" || value === "http://") return null;
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

function fileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (!value || typeof value === "string" || value.size === 0) return null;
  return value;
}

function fileValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is File => typeof value !== "string" && value.size > 0);
}

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && ["jpg", "jpeg", "png", "webp"].includes(fromName)) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function galleryFor(project: Project, index: number) {
  const urls = project.image_urls?.filter(Boolean) ?? [];
  if (urls.length) return urls.slice(0, maxProjectImages);
  if (project.image_url) return [project.image_url];
  return [fallbackImages[index % fallbackImages.length]];
}

function actualImageItems(project: Project) {
  const urls =
    project.image_urls?.length && project.image_urls.some(Boolean)
      ? project.image_urls.filter(Boolean)
      : project.image_url
        ? [project.image_url]
        : [];
  const paths =
    project.image_paths?.length && project.image_paths.some(Boolean)
      ? project.image_paths.filter(Boolean)
      : project.image_path
        ? [project.image_path]
        : [];

  return urls.slice(0, maxProjectImages).map((url, index) => ({
    index,
    path: paths[index] ?? null,
    url,
  }));
}

function publicImageUrl(supabase: SupabaseServerClient, imagePath: string | null) {
  if (!imagePath) return null;
  const { data } = supabase.storage.from(projectImagesBucket).getPublicUrl(imagePath);
  return data.publicUrl;
}

function projectStatus(projects: Project[]) {
  if (projects.length >= 6) return "Strong portfolio base";
  if (projects.length >= 3) return "Good start";
  if (projects.length >= 1) return "First project live";
  return "Portfolio not started";
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold">
      <span>{label}</span>
      {hint ? <span className="ml-2 font-normal text-muted">{hint}</span> : null}
      {children}
    </label>
  );
}

async function uploadProjectImage(
  supabase: SupabaseServerClient,
  userId: string,
  file: File
) {
  if (!allowedImageTypes.includes(file.type)) {
    return {
      error: "Please upload a JPEG, PNG, or WebP image.",
      path: null,
      publicUrl: null,
    };
  }

  if (file.size > maxImageSize) {
    return {
      error: "Please upload an image smaller than 10 MB.",
      path: null,
      publicUrl: null,
    };
  }

  const imagePath = `${userId}/${crypto.randomUUID()}.${extensionFor(file)}`;
  const { error } = await supabase.storage
    .from(projectImagesBucket)
    .upload(imagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return {
      error: `Image upload failed: ${error.message}`,
      path: null,
      publicUrl: null,
    };
  }

  return {
    error: null,
    path: imagePath,
    publicUrl: publicImageUrl(supabase, imagePath),
  };
}

async function uploadProjectImages(
  supabase: SupabaseServerClient,
  userId: string,
  imageFiles: File[]
) {
  if (imageFiles.length > maxProjectImages) {
    return {
      error: `Please upload up to ${maxProjectImages} images per project.`,
      uploadedPaths: [],
      uploadedUrls: [],
    };
  }

  const uploadedPaths: string[] = [];
  const uploadedUrls: string[] = [];

  for (const imageFile of imageFiles) {
    const upload = await uploadProjectImage(supabase, userId, imageFile);
    if (upload.error) {
      if (uploadedPaths.length) {
        await supabase.storage.from(projectImagesBucket).remove(uploadedPaths);
      }

      return {
        error: upload.error,
        uploadedPaths: [],
        uploadedUrls: [],
      };
    }

    if (upload.path && upload.publicUrl) {
      uploadedPaths.push(upload.path);
      uploadedUrls.push(upload.publicUrl);
    }
  }

  return {
    error: null,
    uploadedPaths,
    uploadedUrls,
  };
}

async function addProject(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const title = textValue(formData, "title");
  if (!title) redirect("/account/projects?error=Project%20title%20is%20required");

  const legacyImageFile = fileValue(formData, "image_file");
  const imageFiles = fileValues(formData, "image_files");
  if (legacyImageFile && !imageFiles.length) imageFiles.push(legacyImageFile);

  const upload = await uploadProjectImages(supabase, user.id, imageFiles);
  if (upload.error) {
    redirect(`/account/projects?error=${encodeURIComponent(upload.error)}`);
  }

  const imageUrls = upload.uploadedUrls;
  const imagePaths = upload.uploadedPaths;
  const imageUrl = imageUrls[0] ?? null;
  const imagePath = imagePaths[0] ?? null;

  const { error } = await supabase.from("projects").insert({
    id: crypto.randomUUID(),
    profile_id: user.id,
    title,
    category: textValue(formData, "category"),
    description: textValue(formData, "description"),
    project_url: urlValue(formData, "project_url"),
    image_url: imageUrl,
    image_path: imagePath,
    image_urls: imageUrls,
    image_paths: imagePaths,
  });

  if (error) {
    if (upload.uploadedPaths.length) {
      await supabase.storage.from(projectImagesBucket).remove(upload.uploadedPaths);
    }
    redirect(`/account/projects?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/account");
  revalidatePath("/account/projects");
  revalidatePath(`/designers/${user.id}`);
  redirect("/account/projects?created=1");
}

async function updateProject(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const projectId = textValue(formData, "project_id");
  const title = textValue(formData, "title");

  if (!projectId) redirect("/account/projects?error=Project%20id%20is%20required");
  if (!title) redirect("/account/projects?error=Project%20title%20is%20required");

  const { data: currentProject, error: currentError } = await supabase
    .from("projects")
    .select("id, image_url, image_path, image_urls, image_paths")
    .eq("id", projectId)
    .eq("profile_id", user.id)
    .single();

  if (currentError || !currentProject) {
    redirect(
      `/account/projects?error=${encodeURIComponent(
        currentError?.message ?? "Project not found."
      )}`
    );
  }

  const current = currentProject as Pick<
    Project,
    "id" | "image_url" | "image_path" | "image_urls" | "image_paths"
  >;
  const currentUrls = current.image_urls?.length
    ? current.image_urls.filter(Boolean)
    : current.image_url
      ? [current.image_url]
      : [];
  const currentPaths = current.image_paths?.length
    ? current.image_paths.filter(Boolean)
    : current.image_path
      ? [current.image_path]
      : [];

  const imageFiles = fileValues(formData, "image_files");
  const replaceGallery = formData.get("replace_gallery") === "on";
  const upload = await uploadProjectImages(supabase, user.id, imageFiles);

  if (upload.error) {
    redirect(`/account/projects?error=${encodeURIComponent(upload.error)}`);
  }

  const newUrls = upload.uploadedUrls;
  const newPaths = upload.uploadedPaths;
  const hasNewImages = Boolean(newUrls.length || newPaths.length);
  const nextUrls = hasNewImages
    ? replaceGallery
      ? newUrls
      : [...currentUrls, ...newUrls]
    : currentUrls;
  const nextPaths = hasNewImages
    ? replaceGallery
      ? newPaths
      : [...currentPaths, ...newPaths]
    : currentPaths;

  if (nextUrls.length > maxProjectImages) {
    if (upload.uploadedPaths.length) {
      await supabase.storage.from(projectImagesBucket).remove(upload.uploadedPaths);
    }
    redirect(
      `/account/projects?error=${encodeURIComponent(
        `This project would have ${nextUrls.length} images. Please keep up to ${maxProjectImages}.`
      )}`
    );
  }

  const { error } = await supabase
    .from("projects")
    .update({
      title,
      category: textValue(formData, "category"),
      description: textValue(formData, "description"),
      project_url: urlValue(formData, "project_url"),
      image_url: nextUrls[0] ?? null,
      image_path: nextPaths[0] ?? null,
      image_urls: nextUrls,
      image_paths: nextPaths,
    })
    .eq("id", projectId)
    .eq("profile_id", user.id);

  if (error) {
    if (upload.uploadedPaths.length) {
      await supabase.storage.from(projectImagesBucket).remove(upload.uploadedPaths);
    }
    redirect(`/account/projects?error=${encodeURIComponent(error.message)}`);
  }

  if (replaceGallery && hasNewImages && currentPaths.length) {
    const pathsToRemove = currentPaths.filter((path) => !nextPaths.includes(path));
    if (pathsToRemove.length) {
      await supabase.storage.from(projectImagesBucket).remove(pathsToRemove);
    }
  }

  revalidatePath("/account");
  revalidatePath("/account/projects");
  revalidatePath(`/designers/${user.id}`);
  redirect("/account/projects?updated=1");
}

async function deleteProjectImage(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const projectId = textValue(formData, "project_id");
  const imageIndexValue = textValue(formData, "image_index");
  const imageIndex = imageIndexValue ? Number.parseInt(imageIndexValue, 10) : Number.NaN;

  if (!projectId) redirect("/account/projects?error=Project%20id%20is%20required");
  if (!Number.isInteger(imageIndex) || imageIndex < 0) {
    redirect("/account/projects?error=Image%20selection%20is%20invalid");
  }

  const { data: currentProject, error: currentError } = await supabase
    .from("projects")
    .select("id, image_url, image_path, image_urls, image_paths")
    .eq("id", projectId)
    .eq("profile_id", user.id)
    .single();

  if (currentError || !currentProject) {
    redirect(
      `/account/projects?error=${encodeURIComponent(
        currentError?.message ?? "Project not found."
      )}`
    );
  }

  const current = currentProject as Pick<
    Project,
    "id" | "image_url" | "image_path" | "image_urls" | "image_paths"
  >;
  const currentUrls = current.image_urls?.length
    ? current.image_urls.filter(Boolean)
    : current.image_url
      ? [current.image_url]
      : [];
  const currentPaths = current.image_paths?.length
    ? current.image_paths.filter(Boolean)
    : current.image_path
      ? [current.image_path]
      : [];

  if (imageIndex >= currentUrls.length) {
    redirect("/account/projects?error=Image%20selection%20is%20invalid");
  }

  const pathToRemove = currentPaths[imageIndex] ?? null;
  const nextUrls = currentUrls.filter((_, index) => index !== imageIndex);
  const nextPaths = currentPaths.filter((_, index) => index !== imageIndex);

  const { error } = await supabase
    .from("projects")
    .update({
      image_url: nextUrls[0] ?? null,
      image_path: nextPaths[0] ?? null,
      image_urls: nextUrls,
      image_paths: nextPaths,
    })
    .eq("id", projectId)
    .eq("profile_id", user.id);

  if (error) {
    redirect(`/account/projects?error=${encodeURIComponent(error.message)}`);
  }

  if (pathToRemove) {
    await supabase.storage.from(projectImagesBucket).remove([pathToRemove]);
  }

  revalidatePath("/account");
  revalidatePath("/account/projects");
  revalidatePath(`/designers/${user.id}`);
  revalidatePath(`/projects/${projectId}`);
  redirect("/account/projects?imageDeleted=1");
}

async function deleteProject(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const projectId = textValue(formData, "project_id");
  if (!projectId) redirect("/account/projects?error=Project%20id%20is%20required");

  const { data: currentProject, error: currentError } = await supabase
    .from("projects")
    .select("id, image_path, image_paths")
    .eq("id", projectId)
    .eq("profile_id", user.id)
    .single();

  if (currentError || !currentProject) {
    redirect(
      `/account/projects?error=${encodeURIComponent(
        currentError?.message ?? "Project not found."
      )}`
    );
  }

  const current = currentProject as Pick<Project, "id" | "image_path" | "image_paths">;
  const pathsToRemove = current.image_paths?.length
    ? current.image_paths.filter(Boolean)
    : current.image_path
      ? [current.image_path]
      : [];

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("profile_id", user.id);

  if (error) {
    redirect(`/account/projects?error=${encodeURIComponent(error.message)}`);
  }

  if (pathsToRemove.length) {
    await supabase.storage.from(projectImagesBucket).remove(pathsToRemove);
  }

  revalidatePath("/account");
  revalidatePath("/account/projects");
  revalidatePath(`/designers/${user.id}`);
  revalidatePath(`/projects/${projectId}`);
  redirect("/account/projects?deleted=1");
}

export default async function ManageProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    error?: string;
    created?: string;
    deleted?: string;
    imageDeleted?: string;
    updated?: string;
  }>;
}) {
  const sp = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login");

  const { data: projectsData, error } = await supabase
    .from("projects")
    .select("id, title, category, description, project_url, image_url, image_path, image_urls, image_paths, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  const projects = ((projectsData ?? []) as Project[]).map((project) => ({
    ...project,
    image_urls:
      project.image_urls?.length
        ? project.image_urls
        : project.image_paths?.length
          ? project.image_paths
              .map((path) => publicImageUrl(supabase, path))
              .filter((url): url is string => Boolean(url))
          : project.image_url
            ? [project.image_url]
            : project.image_path
              ? [publicImageUrl(supabase, project.image_path)].filter(
                  (url): url is string => Boolean(url)
                )
              : [],
    image_url:
      project.image_url ||
      publicImageUrl(supabase, project.image_path) ||
      project.image_urls?.[0] ||
      null,
  }));
  const categories = Array.from(
    new Set(projects.map((project) => project.category).filter(Boolean))
  ) as string[];

  return (
    <main className="bg-background">
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/account"
            className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
          >
            Back to account
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="text-sm font-semibold text-primary">Portfolio Manager</div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
                Manage projects
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                Add portfolio examples that make your public designer profile feel real,
                specific, and easy to trust.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-background p-5 shadow-sm">
              <div className="text-sm font-semibold text-muted">Portfolio status</div>
              <div className="mt-2 text-2xl font-bold text-primary">
                {projectStatus(projects)}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-line bg-card p-3">
                  <div className="text-muted">Projects</div>
                  <div className="mt-1 text-xl font-bold">{projects.length}</div>
                </div>
                <div className="rounded-xl border border-line bg-card p-3">
                  <div className="text-muted">Categories</div>
                  <div className="mt-1 text-xl font-bold">{categories.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-7">
          {sp.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {sp.error}
            </div>
          ) : sp.created ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
              Project added. It now appears on your public profile.
            </div>
          ) : sp.updated ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
              Project updated. Public profile gallery has been refreshed.
            </div>
          ) : sp.imageDeleted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
              Image removed from the project gallery.
            </div>
          ) : sp.deleted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
              Project deleted from your public portfolio.
            </div>
          ) : null}

          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-primary">Your portfolio</div>
                <h2 className="mt-1 text-3xl font-bold">Public projects</h2>
              </div>
              <Link
                href={`/designers/${user.id}#portfolio`}
                className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                View public portfolio
              </Link>
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                {error.message}
              </div>
            ) : !projects.length ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-dashed border-line bg-background">
                <div
                  className="min-h-[260px] bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(90deg, rgba(31,23,42,0.70), rgba(31,23,42,0.16)), url(${fallbackImages[0]})`,
                  }}
                >
                  <div className="flex min-h-[260px] max-w-xl flex-col justify-end p-6 text-white">
                    <h3 className="text-3xl font-bold">Start with one strong project</h3>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      Add a title, category, image, and short story. This is enough to make
                      the public profile feel alive.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {projects.map((project, index) => (
                  <article
                    key={project.id}
                    className="overflow-hidden rounded-2xl border border-line bg-background"
                  >
                    <ProjectGallery
                      category={project.category || "Uncategorized"}
                      description={project.description}
                      images={galleryFor(project, index)}
                      title={project.title || "Untitled project"}
                    />
                    <div className="p-5">
                      {project.description ? (
                        <p className="text-sm leading-6 text-muted">
                          {project.description}
                        </p>
                      ) : (
                        <p className="text-sm leading-6 text-muted">
                          Add a description to explain the brief, style, and result.
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
                        >
                          View project page
                        </Link>
                        {project.project_url ? (
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-xl border border-line bg-card px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
                          >
                            Open external page
                          </a>
                        ) : null}
                      </div>
                      {actualImageItems(project).length ? (
                        <details className="mt-5 rounded-2xl border border-line bg-card p-4">
                          <summary className="cursor-pointer text-sm font-semibold text-primary">
                            Manage images
                          </summary>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            {actualImageItems(project).map((image) => (
                              <div
                                key={`${image.url}-${image.index}`}
                                className="overflow-hidden rounded-xl border border-line bg-background"
                              >
                                <div
                                  aria-label={`${project.title || "Project"} image ${
                                    image.index + 1
                                  }`}
                                  className="h-28 w-full bg-cover bg-center"
                                  role="img"
                                  style={{ backgroundImage: `url(${image.url})` }}
                                />
                                <form action={deleteProjectImage} className="p-2">
                                  <input type="hidden" name="project_id" value={project.id} />
                                  <input
                                    type="hidden"
                                    name="image_index"
                                    value={image.index}
                                  />
                                  <button
                                    type="submit"
                                    className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                                  >
                                    Remove image
                                  </button>
                                </form>
                              </div>
                            ))}
                          </div>
                        </details>
                      ) : null}
                      <details className="mt-5 rounded-2xl border border-line bg-card p-4">
                        <summary className="cursor-pointer text-sm font-semibold text-primary">
                          Edit project
                        </summary>
                        <form action={updateProject} className="mt-5 grid gap-4">
                          <input type="hidden" name="project_id" value={project.id} />

                          <Field label="Title">
                            <input
                              name="title"
                              defaultValue={project.title ?? ""}
                              className={fieldClass}
                            />
                          </Field>

                          <Field label="Category">
                            <input
                              name="category"
                              defaultValue={project.category ?? ""}
                              placeholder="Apartment, house, office..."
                              className={fieldClass}
                            />
                          </Field>

                          <Field label="Description">
                            <textarea
                              name="description"
                              defaultValue={project.description ?? ""}
                              rows={4}
                              className={areaClass}
                            />
                          </Field>

                          <Field
                            label="Add images"
                            hint={`${galleryFor(project, index).length}/${maxProjectImages} used`}
                          >
                            <input
                              name="image_files"
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              multiple
                              className={fileClass}
                            />
                          </Field>

                          <Field label="Project link" hint="optional external page">
                            <input
                              name="project_url"
                              defaultValue={project.project_url ?? ""}
                              placeholder="https://your-studio.com/projects/..."
                              className={fieldClass}
                            />
                          </Field>

                          <label className="flex items-start gap-3 rounded-xl border border-line bg-background p-3 text-sm">
                            <input
                              type="checkbox"
                              name="replace_gallery"
                              className="mt-1 h-4 w-4 accent-primary"
                            />
                            <span>
                              <span className="font-semibold">Replace current gallery</span>
                              <span className="mt-1 block text-muted">
                                Leave unchecked to append selected images to this project.
                              </span>
                            </span>
                          </label>

                          <button
                            type="submit"
                            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                          >
                            Save project changes
                          </button>
                        </form>
                      </details>
                      <details className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                        <summary className="cursor-pointer text-sm font-semibold text-red-700">
                          Delete project
                        </summary>
                        <p className="mt-3 text-sm leading-6 text-red-700">
                          This removes the project from your public portfolio and deletes its
                          uploaded images from storage.
                        </p>
                        <form action={deleteProject} className="mt-4">
                          <input type="hidden" name="project_id" value={project.id} />
                          <button
                            type="submit"
                            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Delete this project
                          </button>
                        </form>
                      </details>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <div className="text-sm font-semibold text-primary">Add Project</div>
          <h2 className="mt-1 text-2xl font-bold">Create portfolio card</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Keep the first version simple. A clear title and one strong image are enough
            for now.
          </p>

          <form action={addProject} className="mt-6 grid gap-5">
            <Field label="Title">
              <input name="title" placeholder="Modern Warsaw apartment" className={fieldClass} />
            </Field>

            <Field label="Category" hint="room or project type, used as a public filter">
              <input
                name="category"
                placeholder="Apartment, house, office..."
                className={fieldClass}
              />
            </Field>

            <Field label="Project images" hint="up to 12 JPEG, PNG, or WebP files">
              <input
                name="image_files"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className={fileClass}
              />
            </Field>

            <Field label="Project link" hint="optional external page">
              <input
                name="project_url"
                placeholder="https://your-studio.com/projects/..."
                className={fieldClass}
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                rows={5}
                placeholder="Describe the brief, design direction, and what changed for the client."
                className={areaClass}
              />
            </Field>

            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Add project
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-line bg-background p-4 text-sm leading-6 text-muted">
            Images stay embedded in the project card as a gallery preview. The project link is
            for a separate page you want to share outside ArchiCompass.
          </div>
        </aside>
      </section>
    </main>
  );
}
