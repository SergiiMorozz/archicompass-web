"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const maxImages = 30;
const maxImageSize = 10 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const fieldClass =
  "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal text-foreground outline-none transition focus:border-primary";
const fileClass =
  "mt-2 w-full rounded-xl border border-dashed border-line bg-background px-4 py-4 text-sm font-normal text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white";

function extension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export default function ProjectCreateForm() {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const files = data
      .getAll("image_files")
      .filter((value): value is File => value instanceof File && value.size > 0);

    if (!String(data.get("title") || "").trim()) {
      setError("Project title is required.");
      return;
    }
    if (files.length > maxImages) {
      setError(`Please select up to ${maxImages} images.`);
      return;
    }
    const invalid = files.find((file) => !allowedTypes.has(file.type) || file.size > maxImageSize);
    if (invalid) {
      setError(`${invalid.name} must be a JPEG, PNG, or WebP image smaller than 10 MB.`);
      return;
    }

    setBusy(true);
    setProgress(0);
    const supabase = createSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      window.location.assign("/login?next=/account/projects");
      return;
    }

    const paths: string[] = [];
    const urls: string[] = [];
    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const path = `${user.id}/${crypto.randomUUID()}.${extension(file)}`;
        const { error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw new Error(`Could not upload ${file.name}: ${uploadError.message}`);
        paths.push(path);
        urls.push(supabase.storage.from("project-images").getPublicUrl(path).data.publicUrl);
        setProgress(index + 1);
      }

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: String(data.get("title") || "").trim(),
          category: String(data.get("category") || "").trim() || null,
          description: String(data.get("description") || "").trim() || null,
          projectUrl: String(data.get("project_url") || "").trim() || null,
          imagePaths: paths,
          imageUrls: urls,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Project could not be created.");
      window.location.assign("/account/projects?created=1");
    } catch (reason) {
      if (paths.length) await supabase.storage.from("project-images").remove(paths);
      setError(reason instanceof Error ? reason.message : "Project could not be created.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-5">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
      <label className="block text-sm font-semibold">
        Title
        <input name="title" required placeholder="Modern Warsaw apartment" className={fieldClass} />
      </label>
      <label className="block text-sm font-semibold">
        Category <span className="font-normal text-muted">room or project type</span>
        <input name="category" placeholder="Apartment, house, office..." className={fieldClass} />
      </label>
      <label className="block text-sm font-semibold">
        Project images <span className="font-normal text-muted">up to {maxImages} JPEG, PNG, or WebP files</span>
        <input name="image_files" type="file" accept="image/jpeg,image/png,image/webp" multiple className={fileClass} />
      </label>
      <label className="block text-sm font-semibold">
        Project link <span className="font-normal text-muted">optional external page</span>
        <input name="project_url" type="url" placeholder="https://your-studio.com/projects/..." className={fieldClass} />
      </label>
      <label className="block text-sm font-semibold">
        Description
        <textarea name="description" rows={5} placeholder="Describe the brief, design direction, and result." className={fieldClass} />
      </label>
      <button disabled={busy} type="submit" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
        {busy ? `Uploading image ${progress || 1}...` : "Add project"}
      </button>
    </form>
  );
}
