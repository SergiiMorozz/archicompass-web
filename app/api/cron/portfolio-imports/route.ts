import { NextResponse } from "next/server";
import { runPortfolioImportWorker } from "@/lib/portfolio-ingestion/background-worker";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runPortfolioImportWorker({ maxDurationMs: 50_000 });
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    console.error("Portfolio import worker failed", error);
    return NextResponse.json({ error: "Portfolio import worker is unavailable" }, { status: 503 });
  }
}
