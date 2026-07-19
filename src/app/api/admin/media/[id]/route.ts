import { NextRequest } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const media = await prisma.media.findUnique({ where: { id: params.id } });
  if (!media) return jsonError("Not found", 404);

  try {
    await unlink(path.join(process.cwd(), "public", media.url));
  } catch {
    // file already missing on disk — still remove the DB record
  }

  await prisma.media.delete({ where: { id: params.id } });
  return jsonOk({ ok: true });
}
