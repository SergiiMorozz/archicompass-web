"use client";

import { useState } from "react";
import BrandLogo from "@/components/BrandLogo";

type ShareableStyleAnalysis = {
  primaryStyle: string;
  summary: string;
  colorPalette: string[];
  materials: string[];
  designerPrompt: string;
};

type ShareablePhoto = {
  name: string;
  url: string;
};

const canvasWidth = 1080;
const canvasHeight = 1350;

function paletteColor(label: string, index: number) {
  const value = label.toLowerCase();
  if (value.includes("cream") || value.includes("ivory")) return "#f2eadc";
  if (value.includes("beige") || value.includes("sand")) return "#d8c3a7";
  if (value.includes("greige") || value.includes("taupe")) return "#b9ab9f";
  if (value.includes("oak") || value.includes("wood")) return "#b98255";
  if (value.includes("brown") || value.includes("walnut")) return "#73513b";
  if (value.includes("terracotta") || value.includes("rust")) return "#b86649";
  if (value.includes("green") || value.includes("olive")) return "#778068";
  if (value.includes("blue")) return "#71889f";
  if (value.includes("black") || value.includes("charcoal")) return "#3e3a40";
  if (value.includes("white")) return "#f7f5f0";
  if (value.includes("grey") || value.includes("gray")) return "#aaa7a5";

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
    image.onerror = () => reject(new Error("A reference photo could not be prepared."));
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

function drawPhotoGrid(
  context: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) {
  const x = 60;
  const y = 160;
  const width = 960;
  const height = 430;
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
  if (!context) throw new Error("This browser cannot create the result image.");

  context.fillStyle = "#faf9fb";
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  drawRoundedFill(context, 38, 38, canvasWidth - 76, canvasHeight - 76, 34, "#ffffff");
  const brandLogo = await loadImage("/brand/archicompass-logo-purple.png");
  context.drawImage(brandLogo, 100, 735, 3100, 735, 60, 60, 380, 90);
  context.fillStyle = "#706284";
  context.font = "600 22px Outfit, Arial, sans-serif";
  context.textAlign = "right";
  context.fillText("AI INTERIOR STYLE CHECK", 1020, 99);
  context.textAlign = "left";

  const images = await Promise.all(photos.slice(0, 4).map((photo) => loadImage(photo.url)));
  drawPhotoGrid(context, images);

  context.fillStyle = "#592d86";
  context.font = "700 22px Outfit, Arial, sans-serif";
  context.fillText("YOUR INTERIOR STYLE", 60, 650);

  context.fillStyle = "#251d30";
  context.font = "700 66px Outfit, Arial, sans-serif";
  const titleLines = wrappedLines(context, analysis.primaryStyle, 960, 1);
  titleLines.forEach((line, index) => context.fillText(line, 60, 725 + index * 72));
  const titleBottom = 725 + (titleLines.length - 1) * 72;

  context.fillStyle = "#706284";
  context.font = "400 27px Outfit, Arial, sans-serif";
  const summaryLines = wrappedLines(context, analysis.summary, 960, 3);
  summaryLines.forEach((line, index) => context.fillText(line, 60, titleBottom + 58 + index * 38));

  const paletteY = Math.max(920, titleBottom + 58 + summaryLines.length * 38 + 34);
  context.fillStyle = "#251d30";
  context.font = "700 23px Outfit, Arial, sans-serif";
  context.fillText("PALETTE", 60, paletteY);
  const paletteItems = analysis.colorPalette.slice(0, 4);
  const paletteWidth = (960 - 18 * 3) / 4;
  paletteItems.forEach((item, index) => {
    const itemX = 60 + index * (paletteWidth + 18);
    drawRoundedFill(context, itemX, paletteY + 24, paletteWidth, 82, 18, "#faf9fb");
    context.fillStyle = paletteColor(item, index);
    context.beginPath();
    context.arc(itemX + 32, paletteY + 65, 18, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#251d30";
    context.font = "600 19px Outfit, Arial, sans-serif";
    const label = item.length > 16 ? `${item.slice(0, 15)}...` : item;
    context.fillText(label, itemX + 60, paletteY + 71);
  });

  const materialsY = paletteY + 150;
  context.fillStyle = "#251d30";
  context.font = "700 23px Outfit, Arial, sans-serif";
  context.fillText("MATERIALS", 60, materialsY);
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

  context.drawImage(brandLogo, 100, 735, 3100, 735, 60, 1242, 250, 59);
  context.fillStyle = "#592d86";
  context.textAlign = "right";
  context.font = "700 22px Outfit, Arial, sans-serif";
  context.fillText("From inspiration to the right designer", 1020, 1282);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The result image could not be created."));
    }, "image/png");
  });
}

function safeFileName(style: string) {
  const slug = style
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 42);
  return `archicompass-${slug || "interior-style"}.png`;
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
  const [busyAction, setBusyAction] = useState<"download" | "share" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visiblePhotos = photos.slice(0, 4);

  async function downloadResult() {
    setBusyAction("download");
    setNotice(null);
    setError(null);
    try {
      const blob = await createResultPng({ analysis, photos });
      downloadBlob(blob, safeFileName(analysis.primaryStyle));
      setNotice("PNG downloaded. It is ready for Stories, posts, or messages.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The result could not be downloaded.");
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
      const shareText = `My interior style is ${analysis.primaryStyle}. Created with ArchiCompass.`;

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `My interior style: ${analysis.primaryStyle}`,
          text: shareText,
        });
        setNotice("Result shared.");
      } else if (navigator.share) {
        await navigator.share({
          title: `My interior style: ${analysis.primaryStyle}`,
          text: shareText,
          url: window.location.href,
        });
        setNotice("Result link shared. Use Download PNG to share the visual card.");
      } else {
        await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
        downloadBlob(blob, fileName);
        setNotice("Share text copied and PNG downloaded.");
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "The result could not be shared.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className="mt-5 border-t border-primary/20 pt-5" aria-labelledby="share-style-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase text-primary">Ready to share</div>
          <h3 id="share-style-title" className="mt-1 text-xl font-bold">Your ArchiCompass style card</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
            Download a portrait PNG or share it from your phone. The card uses the first four reference photos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={shareResult}
            disabled={Boolean(busyAction)}
            className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busyAction === "share" ? "Preparing..." : "Share result"}
          </button>
          <button
            type="button"
            onClick={downloadResult}
            disabled={Boolean(busyAction)}
            className="rounded-xl border border-primary bg-card px-4 py-3 text-sm font-semibold text-primary disabled:opacity-60"
          >
            {busyAction === "download" ? "Creating PNG..." : "Download PNG"}
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <BrandLogo className="h-8 w-[148px]" />
          <span className="text-xs font-semibold uppercase text-muted">AI Interior Style Check</span>
        </div>

        <div className={visiblePhotos.length > 1 ? "grid grid-cols-2 gap-1" : "grid"}>
          {visiblePhotos.map((photo, index) => (
            <div key={photo.url} className="relative aspect-[4/3] overflow-hidden bg-primary-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={`Style reference ${index + 1}: ${photo.name}`} className="h-full w-full object-cover" />
              {index === 3 && photos.length > 4 ? (
                <span className="absolute bottom-2 right-2 rounded-full bg-foreground/85 px-3 py-1 text-xs font-semibold text-white">
                  +{photos.length - 4}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="p-5 sm:p-6">
          <div className="text-xs font-semibold uppercase text-primary">Your interior style</div>
          <h4 className="mt-1 text-3xl font-bold">{analysis.primaryStyle}</h4>
          <p className="mt-3 text-sm leading-6 text-muted">{analysis.summary}</p>

          <div className="mt-5">
            <div className="text-xs font-semibold uppercase text-muted">Palette</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {analysis.colorPalette.slice(0, 4).map((color, index) => (
                <div key={color} className="flex items-center gap-3 rounded-lg bg-background px-3 py-2 text-sm font-semibold">
                  <span className="h-6 w-6 shrink-0 rounded-full border border-black/5" style={{ backgroundColor: paletteColor(color, index) }} />
                  <span>{color}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="text-xs font-semibold uppercase text-muted">Materials</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {analysis.materials.slice(0, 6).map((material) => (
                <span key={material} className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">{material}</span>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-line pt-4 text-xs font-semibold text-muted">
            Made with ArchiCompass | From inspiration to the right designer
          </div>
        </div>
      </div>

      {notice ? <p role="status" className="mt-3 text-sm font-semibold text-emerald-800">{notice}</p> : null}
      {error ? <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
    </section>
  );
}
