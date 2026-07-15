"use client";

import { useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import { getProjectCompassCopy } from "@/content/project-compass-copy";
import { copyText } from "@/lib/copy-text";

type ShareableStyleAnalysis = {
  primaryStyle: string;
  confidence: "low" | "medium" | "high";
  summary: string;
  colorPalette: string[];
  materials: string[];
  designerPrompt: string;
  watchOuts: string[];
};

type ShareablePhoto = {
  name: string;
  url: string;
};

const canvasWidth = 1080;
const canvasHeight = 1350;
const logoCrop = { x: 0, y: 793, width: 3371, height: 798 };
const copy = getProjectCompassCopy();

function paletteColor(label: string, index: number) {
  const value = label.toLowerCase();
  if (value.includes("cream") || value.includes("ivory") || value.includes("krem") || value.includes("kość słoniowa")) return "#f2eadc";
  if (value.includes("beige") || value.includes("sand") || value.includes("beż") || value.includes("piask")) return "#d8c3a7";
  if (value.includes("greige") || value.includes("taupe")) return "#b9ab9f";
  if (value.includes("oak") || value.includes("wood") || value.includes("dąb") || value.includes("drewn")) return "#b98255";
  if (value.includes("brown") || value.includes("walnut") || value.includes("brąz") || value.includes("orzech")) return "#73513b";
  if (value.includes("terracotta") || value.includes("rust")) return "#b86649";
  if (value.includes("green") || value.includes("olive") || value.includes("ziele") || value.includes("oliwk")) return "#778068";
  if (value.includes("blue") || value.includes("niebies") || value.includes("błękit")) return "#71889f";
  if (value.includes("black") || value.includes("charcoal") || value.includes("czar") || value.includes("grafit")) return "#3e3a40";
  if (value.includes("white") || value.includes("biel") || value.includes("biały")) return "#f7f5f0";
  if (value.includes("grey") || value.includes("gray") || value.includes("szar")) return "#aaa7a5";

  const hue = (index * 47 + label.length * 19) % 360;
  return `hsl(${hue} 24% 67%)`;
}

function roundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function drawRoundedFill(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string
) {
  roundedRectPath(context, x, y, width, height, radius);
  context.fillStyle = color;
  context.fill();
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(copy.ui.share.imageLoadError));
    image.src = url;
  });
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;

  context.save();
  roundedRectPath(context, x, y, width, height, radius);
  context.clip();
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height
  );
  context.restore();
}

function wrappedLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
      return;
    }
    lines.push(current);
    current = word;
  });
  if (current) lines.push(current);

  if (lines.length <= maxLines) return lines;
  const visible = lines.slice(0, maxLines);
  let finalLine = visible[maxLines - 1];
  while (finalLine.length && context.measureText(`${finalLine}...`).width > maxWidth) {
    finalLine = finalLine.slice(0, -1).trim();
  }
  visible[maxLines - 1] = `${finalLine}...`;
  return visible;
}

function conciseSentence(text: string, maxCharacters = 180) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return copy.ui.share.fallbackSummary;

  const firstSentence = clean.split(/(?<=[.!?])\s+/)[0];
  if (firstSentence.length <= maxCharacters) {
    return /[.!?]$/.test(firstSentence) ? firstSentence : `${firstSentence}.`;
  }

  const words = firstSentence.split(" ");
  let result = "";
  for (const word of words) {
    const candidate = result ? `${result} ${word}` : word;
    if (candidate.length > maxCharacters - 1) break;
    result = candidate;
  }
  return `${result.replace(/[,:;\-]+$/, "")}.`;
}

function confidenceLabel(confidence: ShareableStyleAnalysis["confidence"]) {
  return copy.ui.confidence[confidence];
}

function drawPhotoGrid(
  context: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) {
  const x = 60;
  const y = 142;
  const width = 960;
  const height = 400;
  const gap = 14;

  if (!images.length) {
    drawRoundedFill(context, x, y, width, height, 28, "#f1eaf7");
    return;
  }
  if (images.length === 1) {
    drawCoverImage(context, images[0], x, y, width, height, 28);
    return;
  }
  if (images.length === 2) {
    const itemWidth = (width - gap) / 2;
    images.forEach((image, index) =>
      drawCoverImage(context, image, x + index * (itemWidth + gap), y, itemWidth, height, 28)
    );
    return;
  }

  const itemWidth = (width - gap) / 2;
  const itemHeight = (height - gap) / 2;
  images.slice(0, 4).forEach((image, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    drawCoverImage(
      context,
      image,
      x + column * (itemWidth + gap),
      y + row * (itemHeight + gap),
      itemWidth,
      itemHeight,
      24
    );
  });
}

async function createResultPng({
  analysis,
  photos,
}: {
  analysis: ShareableStyleAnalysis;
  photos: ShareablePhoto[];
}) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error(copy.ui.share.canvasError);

  context.fillStyle = "#faf9fb";
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  drawRoundedFill(context, 38, 38, canvasWidth - 76, canvasHeight - 76, 34, "#ffffff");
  const brandLogo = await loadImage("/brand/archicompass-logo-purple.png");
  context.drawImage(
    brandLogo,
    logoCrop.x,
    logoCrop.y,
    logoCrop.width,
    logoCrop.height,
    60,
    57,
    270,
    64
  );
  context.fillStyle = "#706284";
  context.font = "600 22px Outfit, Arial, sans-serif";
  context.textAlign = "right";
  context.fillText(copy.ui.share.canvasTitle, 1020, 91);
  context.textAlign = "left";

  const images = await Promise.all(photos.slice(0, 4).map((photo) => loadImage(photo.url)));
  drawPhotoGrid(context, images);

  context.fillStyle = "#592d86";
  context.font = "700 22px Outfit, Arial, sans-serif";
  context.fillText(copy.ui.share.canvasStyle, 60, 596);

  context.fillStyle = "#251d30";
  context.font = "700 66px Outfit, Arial, sans-serif";
  const titleLines = wrappedLines(context, analysis.primaryStyle, 700, 1);
  titleLines.forEach((line, index) => context.fillText(line, 60, 670 + index * 72));
  const titleBottom = 670 + (titleLines.length - 1) * 72;
  const titleWidth = context.measureText(titleLines[0]).width;
  context.font = "700 18px Outfit, Arial, sans-serif";
  const confidence = confidenceLabel(analysis.confidence);
  const confidenceWidth = context.measureText(confidence).width + 34;
  const confidenceX = Math.min(1020 - confidenceWidth, 60 + titleWidth + 28);
  drawRoundedFill(context, confidenceX, titleBottom - 31, confidenceWidth, 38, 19, "#f1eaf7");
  context.fillStyle = "#592d86";
  context.fillText(confidence, confidenceX + 17, titleBottom - 6);

  context.fillStyle = "#706284";
  context.font = "400 25px Outfit, Arial, sans-serif";
  const summaryLines = wrappedLines(context, conciseSentence(analysis.summary), 960, 3);
  summaryLines.forEach((line, index) => context.fillText(line, 60, titleBottom + 48 + index * 35));

  const paletteY = Math.max(830, titleBottom + 48 + summaryLines.length * 35 + 28);
  context.fillStyle = "#251d30";
  context.font = "700 23px Outfit, Arial, sans-serif";
  context.fillText(copy.ui.share.canvasPalette, 60, paletteY);
  const paletteItems = analysis.colorPalette.slice(0, 4);
  const paletteWidth = (960 - 18 * 3) / 4;
  paletteItems.forEach((item, index) => {
    const itemX = 60 + index * (paletteWidth + 18);
    context.fillStyle = paletteColor(item, index);
    context.beginPath();
    context.arc(itemX + 22, paletteY + 58, 20, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#251d30";
    context.font = "600 19px Outfit, Arial, sans-serif";
    const label = item.length > 19 ? item.slice(0, 19) : item;
    context.fillText(label, itemX + 52, paletteY + 65);
  });

  const materialsY = paletteY + 116;
  context.fillStyle = "#251d30";
  context.font = "700 23px Outfit, Arial, sans-serif";
  context.fillText(copy.ui.share.canvasMaterials, 60, materialsY);
  let pillX = 60;
  let pillY = materialsY + 24;
  context.font = "600 20px Outfit, Arial, sans-serif";
  analysis.materials.slice(0, 4).forEach((material) => {
    const pillWidth = Math.min(360, context.measureText(material).width + 48);
    if (pillX + pillWidth > 1020) {
      pillX = 60;
      pillY += 58;
    }
    drawRoundedFill(context, pillX, pillY, pillWidth, 44, 22, "#f1eaf7");
    context.fillStyle = "#592d86";
    context.fillText(material, pillX + 24, pillY + 29);
    pillX += pillWidth + 12;
  });

  const designerFitY = Math.max(materialsY + 98, pillY + 72);
  context.fillStyle = "#251d30";
  context.font = "700 23px Outfit, Arial, sans-serif";
  context.fillText(copy.ui.share.canvasDesignerFit, 60, designerFitY);
  context.fillStyle = "#706284";
  context.font = "500 21px Outfit, Arial, sans-serif";
  const fitLines = wrappedLines(
    context,
    conciseSentence(analysis.designerPrompt, 150),
    960,
    2
  );
  fitLines.forEach((line, index) => context.fillText(line, 60, designerFitY + 35 + index * 30));

  context.fillStyle = "#592d86";
  context.textAlign = "left";
  context.font = "700 21px Outfit, Arial, sans-serif";
  context.fillText(copy.ui.share.canvasFooter, 60, 1280);
  context.fillStyle = "#592d86";
  context.textAlign = "right";
  context.font = "600 19px Outfit, Arial, sans-serif";
  context.fillText("ArchiCompass", 1020, 1280);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Nie udało się utworzyć obrazu z wynikiem."));
    }, "image/png");
  });
}

function safeFileName(style: string) {
  const slug = style
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 42);
  return `archicompass-${slug || copy.ui.share.defaultFileName}.png`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

export default function ShareableStyleResult({
  analysis,
  photos,
}: {
  analysis: ShareableStyleAnalysis;
  photos: ShareablePhoto[];
}) {
  const [busyAction, setBusyAction] = useState<"caption" | "download" | "share" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visiblePhotos = photos.slice(0, 4);
  const shareCaption = [
    copy.ui.share.captionStyle(analysis.primaryStyle, confidenceLabel(analysis.confidence)),
    conciseSentence(analysis.summary),
    copy.ui.share.captionDesignerFit(conciseSentence(analysis.designerPrompt, 140)),
    copy.ui.share.captionCta,
  ].join("\n\n");

  async function downloadResult() {
    setBusyAction("download");
    setNotice(null);
    setError(null);
    try {
      const blob = await createResultPng({ analysis, photos });
      downloadBlob(blob, safeFileName(analysis.primaryStyle));
      setNotice(copy.ui.share.downloadSuccess);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.ui.share.downloadError);
    } finally {
      setBusyAction(null);
    }
  }

  async function shareResult() {
    setBusyAction("share");
    setNotice(null);
    setError(null);
    try {
      const blob = await createResultPng({ analysis, photos });
      const fileName = safeFileName(analysis.primaryStyle);
      const file = new File([blob], fileName, { type: "image/png" });
      const shareText = shareCaption;

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: copy.ui.share.shareTitle(analysis.primaryStyle),
          text: shareText,
        });
        setNotice(copy.ui.share.shareSuccess);
      } else if (navigator.share) {
        await navigator.share({
          title: copy.ui.share.shareTitle(analysis.primaryStyle),
          text: shareText,
          url: window.location.href,
        });
        setNotice(copy.ui.share.shareLinkSuccess);
      } else {
        await copyText(`${shareText} ${window.location.href}`);
        downloadBlob(blob, fileName);
        setNotice(copy.ui.share.shareFallbackSuccess);
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : copy.ui.share.shareError);
    } finally {
      setBusyAction(null);
    }
  }

  async function copyCaption() {
    setBusyAction("caption");
    setNotice(null);
    setError(null);
    try {
      await copyText(shareCaption);
      setNotice(copy.ui.share.captionSuccess);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.ui.share.captionError);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className="mt-5 border-t border-primary/20 pt-5" aria-labelledby="share-style-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase text-primary">{copy.ui.share.eyebrow}</div>
          <h3 id="share-style-title" className="mt-1 text-xl font-bold">{copy.ui.share.title}</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
            {copy.ui.share.body}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={shareResult}
            disabled={Boolean(busyAction)}
            className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busyAction === "share" ? copy.ui.share.preparing : copy.ui.share.share}
          </button>
          <button
            type="button"
            onClick={downloadResult}
            disabled={Boolean(busyAction)}
            className="rounded-xl border border-primary bg-card px-4 py-3 text-sm font-semibold text-primary disabled:opacity-60"
          >
            {busyAction === "download" ? copy.ui.share.creating : copy.ui.share.download}
          </button>
          <button
            type="button"
            onClick={copyCaption}
            disabled={Boolean(busyAction)}
            className="rounded-xl border border-line bg-card px-4 py-3 text-sm font-semibold text-foreground disabled:opacity-60"
          >
            {busyAction === "caption"
              ? copy.ui.share.copying
              : notice === copy.ui.share.captionSuccess
                ? copy.ui.share.copied
                : copy.ui.share.copy}
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <BrandLogo className="h-8 w-[148px]" />
          <span className="text-xs font-semibold uppercase text-muted">{copy.ui.share.cardTitle}</span>
        </div>

        <div className={visiblePhotos.length > 1 ? "grid grid-cols-2 gap-1" : "grid"}>
          {visiblePhotos.map((photo, index) => (
            <div key={photo.url} className="relative aspect-[4/3] overflow-hidden bg-primary-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={copy.ui.share.imageAlt(index + 1, photo.name)} className="h-full w-full object-cover" />
              {index === 3 && photos.length > 4 ? (
                <span className="absolute bottom-2 right-2 rounded-full bg-foreground/85 px-3 py-1 text-xs font-semibold text-white">
                  +{photos.length - 4}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="p-5 sm:p-6">
          <div className="text-xs font-semibold uppercase text-primary">{copy.ui.share.canvasStyle}</div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h4 className="text-3xl font-bold">{analysis.primaryStyle}</h4>
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              {confidenceLabel(analysis.confidence)}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">{conciseSentence(analysis.summary)}</p>

          <div className="mt-5">
            <div className="text-xs font-semibold uppercase text-muted">{copy.ui.share.palette}</div>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {analysis.colorPalette.slice(0, 4).map((color, index) => (
                <div key={color} className="text-center text-xs font-semibold">
                  <span className="mx-auto block h-10 w-10 rounded-full border border-black/5" style={{ backgroundColor: paletteColor(color, index) }} />
                  <span className="mt-2 block">{color}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="text-xs font-semibold uppercase text-muted">{copy.ui.share.materials}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {analysis.materials.slice(0, 6).map((material) => (
                <span key={material} className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">{material}</span>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-background p-4">
            <div className="text-xs font-semibold uppercase text-primary">{copy.ui.share.designerFit}</div>
            <p className="mt-2 text-sm leading-6 text-muted">
              {conciseSentence(analysis.designerPrompt, 170)}
            </p>
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <div className="text-sm font-semibold text-primary">
              {copy.ui.share.footer}
            </div>
            <div className="mt-1 text-xs font-semibold text-muted">{copy.ui.share.createdWith}</div>
          </div>
        </div>
      </div>

      {notice ? <p role="status" className="mt-3 text-sm font-semibold text-emerald-800">{notice}</p> : null}
      {error ? <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
    </section>
  );
}
