import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".sanity_cache");

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await context.params;
    const url = new URL(request.url);

    // Reconstruct the Sanity CDN target path
    const relativePath = "/" + (pathSegments ? pathSegments.join("/") : "");
    const targetUrl = `https://cdn.sanity.io${relativePath}${url.search}`;

    // Request path for cache key (matching D:\projects\test\server.js logic)
    const reqUrlForHash = `/sanity-cdn${relativePath}${url.search}`;
    const ext = path.extname(relativePath).toLowerCase();

    // 1. Try legacy 40-char hex cache key from server.js
    const legacyKey =
      Buffer.from(reqUrlForHash).toString("hex").slice(0, 40) + ext;
    const legacyCachedPath = path.join(CACHE_DIR, legacyKey);

    // 2. Try full md5/sha256 or safe filename
    const safeKey =
      Buffer.from(reqUrlForHash).toString("base64url").slice(0, 80) + ext;
    const safeCachedPath = path.join(CACHE_DIR, safeKey);

    let filePathToServe: string | null = null;
    if (fs.existsSync(legacyCachedPath)) {
      filePathToServe = legacyCachedPath;
    } else if (fs.existsSync(safeCachedPath)) {
      filePathToServe = safeCachedPath;
    }

    if (filePathToServe) {
      const buffer = fs.readFileSync(filePathToServe);
      const mime = MIME_TYPES[ext] || "image/jpeg";
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mime,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // 3. Not in cache: fetch from https://cdn.sanity.io
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return new NextResponse(`Remote CDN error: ${response.status}`, {
        status: response.status,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to cache
    try {
      fs.writeFileSync(safeCachedPath, buffer);
    } catch (err) {
      console.warn("Failed to write to .sanity_cache:", err);
    }

    const contentType =
      response.headers.get("content-type") || MIME_TYPES[ext] || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Sanity CDN proxy error:", error);
    return new NextResponse("Internal Proxy Error", {
      status: 502,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
