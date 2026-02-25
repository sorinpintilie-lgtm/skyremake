import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

const tryCapture = async (page: import("puppeteer").Page, url: string) => {
  console.log("[Screenshot API] goto start", { url });
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  console.log("[Screenshot API] goto done", { url });
  const screenshot = (await page.screenshot({ type: "png" })) as Buffer;
  console.log("[Screenshot API] screenshot done", { url, bytes: screenshot.byteLength });
  return screenshot;
};

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url")?.trim();
  console.log("[Screenshot API] incoming", { raw });
  if (!raw) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
    console.log("[Screenshot API] parsed url", { url: target.toString() });
  } catch {
    console.error("[Screenshot API] invalid url", { raw });
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!ALLOWED_PROTOCOLS.has(target.protocol)) {
    console.error("[Screenshot API] blocked protocol", { protocol: target.protocol });
    return NextResponse.json({ error: "Unsupported protocol" }, { status: 400 });
  }

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    let screenshot: Buffer;

    try {
      screenshot = await tryCapture(page, target.toString());
    } catch (firstError) {
      const hostname = target.hostname.replace(/^www\./, "");
      const fallbacks = [
        `https://www.${hostname}${target.pathname}${target.search}`,
        `http://${hostname}${target.pathname}${target.search}`,
      ];

      console.warn("[Screenshot API] primary capture failed, trying fallbacks", {
        primary: target.toString(),
        error: firstError instanceof Error ? firstError.message : String(firstError),
        fallbacks,
      });

      let lastError: unknown = firstError;
      let captured: Buffer | null = null;
      for (const candidate of fallbacks) {
        try {
          captured = await tryCapture(page, candidate);
          break;
        } catch (fallbackError) {
          lastError = fallbackError;
          console.warn("[Screenshot API] fallback failed", {
            url: candidate,
            error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
          });
        }
      }

      if (!captured) {
        throw lastError;
      }

      screenshot = captured;
    }

    return new NextResponse(new Uint8Array(screenshot), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=900",
      },
    });
  } catch (error) {
    console.error("[Screenshot API] capture failed", {
      url: target.toString(),
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Failed to capture screenshot" }, { status: 500 });
  } finally {
    await browser.close();
    console.log("[Screenshot API] browser closed", { url: target.toString() });
  }
}

