"use client";

import { useMemo, useRef, useState } from "react";
import {
  type ArticleBlock,
  type ArticleBlockType,
  type ArticleTable,
  parseArticleBlocks,
} from "@/lib/article-content";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Language = "pl" | "en";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 10 * 1024 * 1024;
const fieldClass = "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 text-sm font-normal outline-none transition focus:border-primary";

const blockLabels: Record<ArticleBlockType, string> = {
  paragraph: "Akapit",
  heading: "Nagłówek",
  image: "Zdjęcie",
  table: "Tabela",
  quote: "Cytat",
  callout: "Wyróżnienie / CTA",
  faq: "Pytanie i odpowiedź",
  divider: "Separator",
};

function blockId() {
  return `block-${crypto.randomUUID().replace(/-/g, "")}`;
}

function blankTable(): ArticleTable {
  return {
    caption_pl: "",
    caption_en: "",
    headers_pl: ["Kolumna 1", "Kolumna 2"],
    headers_en: ["Column 1", "Column 2"],
    rows_pl: [["", ""], ["", ""]],
    rows_en: [["", ""], ["", ""]],
  };
}

function createBlock(type: ArticleBlockType): ArticleBlock {
  const id = blockId();
  if (type === "table") return { id, type, table: blankTable() };
  if (type === "heading") return { id, type, level: 2, content_pl: "", content_en: "" };
  if (type === "paragraph") return { id, type, tone: "body", content_pl: "", content_en: "" };
  if (type === "image") return { id, type, image_url: "", alt_pl: "", alt_en: "", caption_pl: "", caption_en: "" };
  if (type === "faq") return { id, type, question_pl: "", question_en: "", answer_pl: "", answer_en: "" };
  if (type === "callout") return { id, type, content_pl: "", content_en: "", link_url: "", link_label_pl: "", link_label_en: "" };
  return { id, type, content_pl: "", content_en: "" };
}

function languageField(base: string, language: Language) {
  return `${base}_${language}` as keyof ArticleBlock;
}

function copyFor(block: ArticleBlock, field: string, language: Language) {
  return String(block[languageField(field, language)] || "");
}

function initialContent(value: unknown) {
  return parseArticleBlocks(value);
}

export default function ArticleBlockEditor({
  articleId,
  initialBlocks,
}: {
  articleId: string;
  initialBlocks: unknown;
}) {
  const [language, setLanguage] = useState<Language>("pl");
  const [blocks, setBlocks] = useState<ArticleBlock[]>(() => initialContent(initialBlocks));
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const textareas = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  function updateBlock(id: string, change: (block: ArticleBlock) => ArticleBlock) {
    setBlocks((current) => current.map((block) => block.id === id ? change(block) : block));
  }

  function updateLocalizedField(id: string, field: string, value: string) {
    updateBlock(id, (block) => ({ ...block, [languageField(field, language)]: value }));
  }

  function moveBlock(id: string, direction: -1 | 1) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function formatSelection(id: string, field: string, before: string, after: string) {
    const key = `${id}-${field}`;
    const element = textareas.current[key];
    const value = copyFor(blocks.find((block) => block.id === id) || createBlock("paragraph"), field, language);
    if (!element) return;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const nextValue = `${value.slice(0, start)}${before}${value.slice(start, end) || "tekst"}${after}${value.slice(end)}`;
    updateLocalizedField(id, field, nextValue);
    requestAnimationFrame(() => {
      element.focus();
      const selectedLength = Math.max(end - start, 4);
      element.setSelectionRange(start + before.length, start + before.length + selectedLength);
    });
  }

  async function uploadImage(id: string, file: File) {
    setError("");
    if (!allowedImageTypes.has(file.type)) {
      setError("Wybierz plik JPEG, PNG albo WebP.");
      return;
    }
    if (file.size > maxImageSize) {
      setError("Jedno zdjęcie może mieć maksymalnie 10 MB.");
      return;
    }
    setUploading(id);
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
      updateBlock(id, (block) => ({ ...block, image_url: url, storage_path: path }));
    } catch (reason) {
      setError(reason instanceof Error ? `Nie udało się przesłać zdjęcia: ${reason.message}` : "Nie udało się przesłać zdjęcia.");
    } finally {
      setUploading(null);
    }
  }

  function localizedTextarea(block: ArticleBlock, field: string, label: string, rows = 5, hint?: string) {
    const key = `${block.id}-${field}`;
    return (
      <label className="block text-sm font-semibold">
        {label} <span className="font-normal text-muted">({language === "pl" ? "wersja polska" : "English version"})</span>
        <div className="mt-2 flex flex-wrap gap-2 rounded-t-xl border border-b-0 border-line bg-primary-soft/40 px-3 py-2">
          <button type="button" onClick={() => formatSelection(block.id, field, "**", "**")} className="rounded-md border border-line bg-card px-2 py-1 text-xs font-bold" aria-label="Pogrub zaznaczony tekst">B</button>
          <button type="button" onClick={() => formatSelection(block.id, field, "_", "_")} className="rounded-md border border-line bg-card px-2 py-1 text-xs italic" aria-label="Pochyl zaznaczony tekst">I</button>
          <span className="self-center text-xs text-muted">Zaznacz tekst, aby dodać pogrubienie lub kursywę.</span>
        </div>
        <textarea
          ref={(element) => { textareas.current[key] = element; }}
          value={copyFor(block, field, language)}
          onChange={(event) => updateLocalizedField(block.id, field, event.target.value)}
          rows={rows}
          className={`${fieldClass} mt-0 rounded-t-none`}
        />
        {hint ? <span className="mt-2 block text-xs font-normal text-muted">{hint}</span> : null}
      </label>
    );
  }

  function updateTable(block: ArticleBlock, change: (table: ArticleTable) => ArticleTable) {
    updateBlock(block.id, (current) => ({ ...current, table: change(current.table || blankTable()) }));
  }

  function renderTable(block: ArticleBlock) {
    const table = block.table || blankTable();
    const headers = language === "pl" ? table.headers_pl : table.headers_en;
    const rows = language === "pl" ? table.rows_pl : table.rows_en;
    const captionKey = language === "pl" ? "caption_pl" : "caption_en";
    const headerKey = language === "pl" ? "headers_pl" : "headers_en";
    const rowKey = language === "pl" ? "rows_pl" : "rows_en";
    const columnCount = Math.max(headers.length, 1);
    return (
      <div className="grid gap-4">
        <label className="text-sm font-semibold">
          Podpis tabeli <span className="font-normal text-muted">(opcjonalnie)</span>
          <input
            value={String(table[captionKey])}
            onChange={(event) => updateTable(block, (current) => ({ ...current, [captionKey]: event.target.value }))}
            className={fieldClass}
          />
        </label>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-primary-soft">
              <tr>
                {Array.from({ length: columnCount }, (_, columnIndex) => (
                  <th key={columnIndex} className="min-w-40 border-b border-line p-2 text-left">
                    <input
                      value={headers[columnIndex] || ""}
                      onChange={(event) => updateTable(block, (current) => {
                        const next = [...current[headerKey]];
                        next[columnIndex] = event.target.value;
                        return { ...current, [headerKey]: next };
                      })}
                      placeholder={`Nagłówek ${columnIndex + 1}`}
                      className="w-full rounded-lg border border-line bg-card px-3 py-2 font-semibold outline-none focus:border-primary"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-line last:border-0">
                  {Array.from({ length: columnCount }, (_, columnIndex) => (
                    <td key={columnIndex} className="p-2">
                      <input
                        value={row[columnIndex] || ""}
                        onChange={(event) => updateTable(block, (current) => {
                          const nextRows = current[rowKey].map((currentRow) => [...currentRow]);
                          nextRows[rowIndex][columnIndex] = event.target.value;
                          return { ...current, [rowKey]: nextRows };
                        })}
                        className="w-full rounded-lg border border-line bg-background px-3 py-2 outline-none focus:border-primary"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => updateTable(block, (current) => ({
            ...current,
            rows_pl: [...current.rows_pl, Array(current.headers_pl.length).fill("")],
            rows_en: [...current.rows_en, Array(current.headers_en.length).fill("")],
          }))} className="rounded-lg border border-line bg-background px-3 py-2 text-sm font-semibold">+ wiersz</button>
          <button type="button" disabled={columnCount >= 8} onClick={() => updateTable(block, (current) => ({
            ...current,
            headers_pl: [...current.headers_pl, ""],
            headers_en: [...current.headers_en, ""],
            rows_pl: current.rows_pl.map((row) => [...row, ""]),
            rows_en: current.rows_en.map((row) => [...row, ""]),
          }))} className="rounded-lg border border-line bg-background px-3 py-2 text-sm font-semibold disabled:opacity-50">+ kolumna</button>
          <button type="button" disabled={rows.length <= 1} onClick={() => updateTable(block, (current) => ({
            ...current,
            rows_pl: current.rows_pl.slice(0, -1),
            rows_en: current.rows_en.slice(0, -1),
          }))} className="rounded-lg border border-line bg-background px-3 py-2 text-sm font-semibold disabled:opacity-50">Usuń ostatni wiersz</button>
        </div>
      </div>
    );
  }

  function renderBlockFields(block: ArticleBlock) {
    if (block.type === "divider") return <p className="text-sm text-muted">Po publikacji w tym miejscu pojawi się pozioma linia oddzielająca sekcje.</p>;
    if (block.type === "paragraph") {
      return <div className="grid gap-4"><label className="text-sm font-semibold">Wielkość tekstu<select value={block.tone || "body"} onChange={(event) => updateBlock(block.id, (current) => ({ ...current, tone: event.target.value as ArticleBlock["tone"] }))} className={fieldClass}><option value="lead">Lead (większy)</option><option value="body">Tekst podstawowy</option><option value="small">Tekst pomocniczy (mniejszy)</option></select></label>{localizedTextarea(block, "content", "Treść", 7)}</div>;
    }
    if (block.type === "heading") {
      return <div className="grid gap-4"><label className="text-sm font-semibold">Poziom nagłówka<select value={block.level || 2} onChange={(event) => updateBlock(block.id, (current) => ({ ...current, level: Number(event.target.value) as 2 | 3 | 4 }))} className={fieldClass}><option value="2">H2 — główna sekcja</option><option value="3">H3 — podsekcja</option><option value="4">H4 — mała podsekcja</option></select></label>{localizedTextarea(block, "content", "Nagłówek", 3, "W artykule używaj H2 dla głównych tematów i H3 dla ich rozwinięć.")}</div>;
    }
    if (block.type === "quote") return localizedTextarea(block, "content", "Cytat", 4);
    if (block.type === "callout") return <div className="grid gap-4">{localizedTextarea(block, "content", "Tekst wyróżnienia", 4)}<label className="text-sm font-semibold">Adres przycisku <span className="font-normal text-muted">(opcjonalnie)</span><input value={block.link_url || ""} onChange={(event) => updateBlock(block.id, (current) => ({ ...current, link_url: event.target.value }))} placeholder="/project-compass albo https://" className={fieldClass} /></label><label className="text-sm font-semibold">Tekst przycisku <span className="font-normal text-muted">({language === "pl" ? "wersja polska" : "English version"})</span><input value={copyFor(block, "link_label", language)} onChange={(event) => updateLocalizedField(block.id, "link_label", event.target.value)} className={fieldClass} /></label></div>;
    if (block.type === "faq") return <div className="grid gap-4"><label className="text-sm font-semibold">Pytanie <span className="font-normal text-muted">({language === "pl" ? "wersja polska" : "English version"})</span><input value={copyFor(block, "question", language)} onChange={(event) => updateLocalizedField(block.id, "question", event.target.value)} className={fieldClass} /></label>{localizedTextarea(block, "answer", "Odpowiedź", 5)}</div>;
    if (block.type === "table") return renderTable(block);
    if (block.type === "image") {
      return <div className="grid gap-4"><label className="text-sm font-semibold">Prześlij zdjęcie<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading === block.id} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(block.id, file); }} className={`${fieldClass} file:mr-4 file:rounded-lg file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:font-semibold file:text-primary`} /></label><label className="text-sm font-semibold">lub adres zdjęcia<input type="url" value={block.image_url || ""} onChange={(event) => updateBlock(block.id, (current) => ({ ...current, image_url: event.target.value, storage_path: "" }))} placeholder="https://" className={fieldClass} /></label>{block.image_url ? <div className="overflow-hidden rounded-xl border border-line bg-background">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={block.image_url} alt="Podgląd zdjęcia w artykule" className="max-h-80 w-full object-cover" /></div> : null}<label className="text-sm font-semibold">Alt tekst <span className="font-normal text-muted">({language === "pl" ? "wersja polska" : "English version"})</span><input value={copyFor(block, "alt", language)} onChange={(event) => updateLocalizedField(block.id, "alt", event.target.value)} placeholder="Co dokładnie pokazuje zdjęcie?" className={fieldClass} /></label><label className="text-sm font-semibold">Podpis pod zdjęciem <span className="font-normal text-muted">(opcjonalnie)</span><input value={copyFor(block, "caption", language)} onChange={(event) => updateLocalizedField(block.id, "caption", event.target.value)} className={fieldClass} /></label>{uploading === block.id ? <p className="text-sm font-semibold text-primary">Przesyłanie zdjęcia…</p> : null}</div>;
    }
    return null;
  }

  return (
    <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
      <input type="hidden" name="content_blocks" value={JSON.stringify(blocks)} />
      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-primary">Treść artykułu</div>
          <h2 className="mt-1 text-2xl font-bold">Układaj publikację z bloków</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Możesz mieszać tekst, nagłówki, zdjęcia, tabele i FAQ. Jeśli nie wpiszesz angielskiej wersji, na stronie EN zostanie użyty poprawny tekst polski.</p>
        </div>
        <div className="inline-flex rounded-xl border border-line bg-background p-1">
          <button type="button" onClick={() => setLanguage("pl")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${language === "pl" ? "bg-primary text-white" : "text-muted"}`}>PL</button>
          <button type="button" onClick={() => setLanguage("en")} className={`rounded-lg px-4 py-2 text-sm font-semibold ${language === "en" ? "bg-primary text-white" : "text-muted"}`}>EN</button>
        </div>
      </div>
      {error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
      <div className="mt-6 grid gap-5">
        {!blocks.length ? <div className="rounded-xl border border-dashed border-line bg-background p-5 text-sm leading-6 text-muted">Ten artykuł nie ma jeszcze bloków. Dodaj pierwszy blok poniżej albo zapisz szkic bez zmian — dotychczasowa treść pozostanie bezpiecznie widoczna.</div> : null}
        {blocks.map((block, index) => (
          <section key={block.id} className="rounded-xl border border-line bg-background p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div className="flex items-center gap-3"><span className="rounded-lg bg-primary-soft px-3 py-1.5 text-sm font-bold text-primary">{String(index + 1).padStart(2, "0")}</span><h3 className="font-bold">{blockLabels[block.type]}</h3></div>
              <div className="flex flex-wrap gap-2"><button type="button" onClick={() => moveBlock(block.id, -1)} disabled={index === 0} className="rounded-lg border border-line bg-card px-3 py-2 text-sm font-semibold disabled:opacity-40">W górę</button><button type="button" onClick={() => moveBlock(block.id, 1)} disabled={index === blocks.length - 1} className="rounded-lg border border-line bg-card px-3 py-2 text-sm font-semibold disabled:opacity-40">W dół</button><button type="button" onClick={() => setBlocks((current) => current.filter((item) => item.id !== block.id))} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">Usuń</button></div>
            </div>
            <div className="mt-5">{renderBlockFields(block)}</div>
          </section>
        ))}
      </div>
      <div className="mt-6 border-t border-line pt-5">
        <div className="text-sm font-semibold">Dodaj blok</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(blockLabels) as ArticleBlockType[]).map((type) => <button type="button" key={type} onClick={() => setBlocks((current) => [...current, createBlock(type)])} className="rounded-xl border border-line bg-background px-4 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary">+ {blockLabels[type]}</button>)}
        </div>
      </div>
    </section>
  );
}
