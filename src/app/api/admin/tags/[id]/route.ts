import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.nameAr) data.nameAr = body.nameAr;
  if (body.nameEn) data.nameEn = body.nameEn;
  try {
    const tag = await prisma.tag.update({ where: { id: params.id }, data });
    return jsonOk(tag);
  } catch {
    return jsonError("Not found", 404);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.tag.delete({ where: { id: params.id } });
    return jsonOk({ ok: true });
  } catch {
    return jsonError("Not found", 404);
  }
}
