"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  articleBlocksToRichHtml,
  parseArticleBlocks,
  type ArticleBlock,
} from "@/lib/article-content";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Language = "pl" | "en";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 10 * 1024 * 1024;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function emptyDocument() {
  return "<p><br></p>";
}

function imagePathMap(blocks: ArticleBlock[]) {
  return blocks.reduce<Record<string, string>>((paths, block) => {
    if (block.type === "image" && block.image_url && block.storage_path) paths[block.image_url] = block.storage_path;
    return paths;
  }, {});
}

export default function ArticleRichTextEditor({
  articleId,
  initialBlocks,
}: {
  articleId: string;
  initialBlocks: unknown;
}) {
  const blocks = useMemo(() => parseArticleBlocks(initialBlocks), [initialBlocks]);
  const [language, setLanguage] = useState<Language>("pl");
  const [documents, setDocuments] = useState(() => ({
    pl: articleBlocksToRichHtml(blocks, "pl") || emptyDocument(),
    en: articleBlocksToRichHtml(blocks, "en") || emptyDocument(),
  }));
  const [pathsByUrl, setPathsByUrl] = useState(() => imagePathMap(blocks));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState("");
  const [selectedImageCaption, setSelectedImageCaption] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rangeRef = useRef<Range | null>(null);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  function persistDocument() {
    const html = editorRef.current?.innerHTML || emptyDocument();
    setDocuments((current) => ({ ...current, [language]: html }));
  }

  function rememberSelection() {
    const selection = window.getSelection();
    if (selection?.rangeCount) rangeRef.current = selection.getRangeAt(0).cloneRange();
  }

  function restoreSelection() {
    const selection = window.getSelection();
    if (!selection || !rangeRef.current) return;
    selection.removeAllRanges();
    selection.addRange(rangeRef.current);
  }

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.innerHTML = documents[language] || emptyDocument();
    editor.querySelectorAll("img").forEach((image) => {
      if (!image.dataset.editorImageId) image.dataset.editorImageId = crypto.randomUUID();
    });
    setSelectedImageId(null);
    setSelectedImageAlt("");
    setSelectedImageCaption("");
  }, [language]); // The document is intentionally uncontrolled while typing to preserve the caret.

  const serializedBlocks = useMemo(() => {
    const usedPaths = Object.entries(pathsByUrl)
      .filter(([url]) => documents.pl.includes(url) || documents.en.includes(url))
      .map(([, path]) => path);
    return JSON.stringify([{
      id: "rich-document",
      type: "rich_text",
      html_pl: documents.pl,
      html_en: documents.en,
      storage_paths: usedPaths,
    }]);
  }, [documents, pathsByUrl]);

  function switchLanguage(nextLanguage: Language) {
    if (nextLanguage === language) return;
    persistDocument();
    setLanguage(nextLanguage);
  }

  function format(command: string, value?: string) {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, value);
    rememberSelection();
    persistDocument();
  }

  function insertHtml(html: string) {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand("insertHTML", false, html);
    rememberSelection();
    persistDocument();
  }

  function addLink() {
    const url = window.prompt(language === "pl" ? "Wklej adres linku" : "Paste the link URL");
    if (!url) return;
    const safe = url.trim();
    if (!/^https?:\/\//i.test(safe) && !(safe.startsWith("/") && !safe.startsWith("//"))) {
      setError(language === "pl" ? "Link musi zaczynać się od https://, http:// albo /." : "The link must begin with https://, http://, or /.");
      return;
    }
    format("createLink", safe);
  }

  function insertTable() {
    insertHtml("<table><thead><tr><th>Nagłówek 1</th><th>Nagłówek 2</th></tr></thead><tbody><tr><td>Treść</td><td>Treść</td></tr><tr><td>Treść</td><td>Treść</td></tr></tbody></table><p><br></p>");
  }

  function addTableRow() {
    const selection = window.getSelection();
    const node = selection?.anchorNode;
    const element = node instanceof Element ? node : node?.parentElement;
    const row = element?.closest("tr");
    const body = row?.closest("table")?.querySelector("tbody");
    if (!body) {
      setError(language === "pl" ? "Ustaw kursor w tabeli, aby dodać wiersz." : "Place the cursor in a table to add a row.");
      return;
    }
    const cells = row?.querySelectorAll("th, td").length || 2;
    const newRow = document.createElement("tr");
    for (let index = 0; index < cells; index += 1) newRow.innerHTML += "<td>Treść</td>";
    body.append(newRow);
    persistDocument();
  }

  function selectImage(target: HTMLImageElement) {
    const id = target.dataset.editorImageId || crypto.randomUUID();
    target.dataset.editorImageId = id;
    editorRef.current?.querySelectorAll("img[data-selected='true']").forEach((image) => image.removeAttribute("data-selected"));
    target.dataset.selected = "true";
    setSelectedImageId(id);
    setSelectedImageAlt(target.alt || "");
    setSelectedImageCaption(target.closest("figure")?.querySelector("figcaption")?.textContent || "");
    persistDocument();
  }

  function selectedImage() {
    return Array.from(editorRef.current?.querySelectorAll("img") || []).find((image) => image.dataset.editorImageId === selectedImageId) || null;
  }

  function updateSelectedImage(kind: "alt" | "caption", value: string) {
    const image = selectedImage();
    if (!image) return;
    if (kind === "alt") {
      image.alt = value;
      setSelectedImageAlt(value);
    } else {
      const figure = image.closest("figure");
      if (!figure) return;
      let caption = figure.querySelector("figcaption");
      if (!caption) {
        caption = document.createElement("figcaption");
        figure.append(caption);
      }
      caption.textContent = value;
      setSelectedImageCaption(value);
    }
    persistDocument();
  }

  async function uploadImage(file: File) {
    setError("");
    if (!allowedImageTypes.has(file.type)) {
      setError("Wybierz plik JPEG, PNG albo WebP.");
      return;
    }
    if (file.size > maxImageSize) {
      setError("Jedno zdjęcie może mieć maksymalnie 10 MB.");
      return;
    }
    rememberSelection();
    setUploading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData.user;
      if (userError || !user) throw new Error("Sesja wygasła. Odśwież stronę i zaloguj się ponownie.");
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${user.id}/inspiration/${articleId}/inline/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("project-images").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) throw new Error(uploadError.message);
      const url = supabase.storage.from("project-images").getPublicUrl(path).data.publicUrl;
      const imageId = crypto.randomUUID();
      const caption = imageCaption.trim();
      insertHtml(`<figure><img src="${escapeHtml(url)}" alt="${escapeHtml(imageAlt.trim())}" data-editor-image-id="${imageId}">${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure><p><br></p>`);
      setPathsByUrl((current) => ({ ...current, [url]: path }));
      setImageAlt("");
      setImageCaption("");
    } catch (reason) {
      setError(reason instanceof Error ? `Nie udało się przesłać zdjęcia: ${reason.message}` : "Nie udało się przesłać zdjęcia.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const toolClass = "rounded-lg border border-line bg-card px-3 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary";

  return (
    <section className="article-document-editor rounded-lg border border-line bg-card p-5 shadow-sm sm:p-6">
      <input type="hidden" name="content_blocks" value={serializedBlocks} />
      <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm font-semibold text-primary">Treść artykułu</div>
          <h2 className="mt-1 text-2xl font-bold">Napisz artykuł w jednym dokumencie</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Zaznacz fragment tekstu i od razu zmieniaj jego formatowanie. Zdjęcia i tabele trafiają dokładnie tam, gdzie ustawisz kursor.</p>
        </div>
        <div className="inline-flex w-fit rounded-xl border border-line bg-background p-1">
          <button type="button" onClick={() => switchLanguage("pl")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${language === "pl" ? "bg-primary text-white" : "text-muted"}`}>PL</button>
          <button type="button" onClick={() => switchLanguage("en")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${language === "en" ? "bg-primary text-white" : "text-muted"}`}>EN</button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-background p-3">
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("bold")} className={`${toolClass} font-bold`} aria-label="Pogrubienie">B</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("italic")} className={`${toolClass} italic`} aria-label="Kursywa">I</button>
        <span className="h-7 w-px bg-line" />
        <select value="" onChange={(event) => { if (event.target.value) format("formatBlock", event.target.value); event.target.value = ""; }} className="rounded-lg border border-line bg-card px-3 py-2 text-sm font-semibold">
          <option value="">Format akapitu</option><option value="p">Tekst podstawowy</option><option value="h2">Nagłówek H2</option><option value="h3">Nagłówek H3</option><option value="h4">Nagłówek H4</option>
        </select>
        <select value="" onChange={(event) => { if (event.target.value) format("fontSize", event.target.value); event.target.value = ""; }} className="rounded-lg border border-line bg-card px-3 py-2 text-sm font-semibold">
          <option value="">Wielkość tekstu</option><option value="2">Mniejszy</option><option value="3">Standardowy</option><option value="5">Większy</option>
        </select>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("insertUnorderedList")} className={toolClass}>Lista</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("insertOrderedList")} className={toolClass}>1. Lista</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("formatBlock", "blockquote")} className={toolClass}>Cytat</button>
        <span className="h-7 w-px bg-line" />
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={addLink} className={toolClass}>Link</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("unlink")} className={toolClass}>Usuń link</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={insertTable} className={toolClass}>Tabela</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={addTableRow} className={toolClass}>+ wiersz</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("undo")} className={toolClass}>Cofnij</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format("redo")} className={toolClass}>Ponów</button>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-dashed border-line bg-primary-soft/30 p-4 lg:grid-cols-[1fr_1fr_auto]">
        <label className="text-sm font-semibold">Alt tekst zdjęcia — {language.toUpperCase()}<input value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} placeholder={language === "pl" ? "Krótko opisz zdjęcie" : "Briefly describe the image"} className="mt-2 w-full rounded-lg border border-line bg-card px-3 py-2 font-normal outline-none focus:border-primary" /></label>
        <label className="text-sm font-semibold">Podpis pod zdjęciem — {language.toUpperCase()}<input value={imageCaption} onChange={(event) => setImageCaption(event.target.value)} placeholder={language === "pl" ? "Opcjonalnie" : "Optional"} className="mt-2 w-full rounded-lg border border-line bg-card px-3 py-2 font-normal outline-none focus:border-primary" /></label>
        <div className="flex items-end"><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); }} /><button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{uploading ? "Przesyłanie…" : "Wstaw zdjęcie"}</button></div>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">Dodaj alt tekst przed wysłaniem pliku. Po kliknięciu zdjęcia w tekście możesz go później poprawić.</p>

      {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={language === "pl" ? "Zacznij pisać artykuł…" : "Start writing your article…"}
        onInput={() => { rememberSelection(); persistDocument(); }}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        onClick={(event) => { const target = event.target; if (target instanceof HTMLImageElement) selectImage(target); else rememberSelection(); }}
        className="mt-5 min-h-[32rem] rounded-xl border border-line bg-background px-5 py-6 text-lg leading-9 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 sm:px-8"
      />

      {selectedImageId ? <div className="mt-5 grid gap-4 rounded-xl border border-primary/30 bg-primary-soft/45 p-4 lg:grid-cols-2"><label className="text-sm font-semibold">Alt tekst wybranego zdjęcia — {language.toUpperCase()}<input value={selectedImageAlt} onChange={(event) => updateSelectedImage("alt", event.target.value)} className="mt-2 w-full rounded-lg border border-line bg-card px-3 py-2 font-normal outline-none focus:border-primary" /></label><label className="text-sm font-semibold">Podpis wybranego zdjęcia — {language.toUpperCase()}<input value={selectedImageCaption} onChange={(event) => updateSelectedImage("caption", event.target.value)} className="mt-2 w-full rounded-lg border border-line bg-card px-3 py-2 font-normal outline-none focus:border-primary" /></label></div> : null}
    </section>
  );
}
