import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: { projects: { orderBy: { order: "asc" }, include: { tags: true } } },
  });
  if (!category) return jsonError("Not found", 404);
  return jsonOk(category);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const allowed = [
    "slug",
    "isContact",
    "published",
    "colorFrom",
    "colorTo",
    "glowColorHex",
    "image",
    "labelAr",
    "labelEn",
    "greetTitleAr",
    "greetTitleEn",
    "greetTextAr",
    "greetTextEn",
  ] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }
  try {
    const category = await prisma.category.update({ where: { id: params.id }, data });
    return jsonOk(category);
  } catch {
    return jsonError("Not found", 404);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.category.delete({ where: { id: params.id } });
    return jsonOk({ ok: true });
  } catch {
    return jsonError("Not found", 404);
  }
}
