import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_PREFIXES = ["image/", "video/"];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return jsonError("No file provided");
  }

  if (!ALLOWED_PREFIXES.some((p) => file.type.startsWith(p))) {
    return jsonError("Only image and video uploads are allowed");
  }

  if (file.size > MAX_SIZE) {
    return jsonError("File exceeds 50MB limit");
  }

  const ext = path.extname(file.name) || "";
  const filename = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const url = `/uploads/${filename}`;
  const kind = file.type.startsWith("video/") ? "video" : "image";

  const media = await prisma.media.create({
    data: { filename, url, mime: file.type, size: file.size, kind },
  });

  return jsonOk(media, 201);
}
