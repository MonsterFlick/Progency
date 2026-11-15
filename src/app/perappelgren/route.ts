import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "perappelgren",
    "index.html"
  );
  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 });
  }
  const html = fs.readFileSync(filePath, "utf-8");
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
