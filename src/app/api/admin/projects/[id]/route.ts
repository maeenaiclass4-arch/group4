import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { tags: true, category: true },
  });
  if (!project) return jsonError("Not found", 404);
  return jsonOk(project);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const allowed = [
    "categoryId",
    "featured",
    "published",
    "titleAr",
    "titleEn",
    "descAr",
    "descEn",
    "image",
    "video",
    "softTag",
    "catLabelAr",
    "catLabelEn",
  ] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }
  if (body.tagIds) {
    data.tags = { set: body.tagIds.map((id: string) => ({ id })) };
  }
  try {
    const project = await prisma.project.update({
      where: { id: params.id },
      data,
      include: { tags: true, category: true },
    });
    return jsonOk(project);
  } catch {
    return jsonError("Not found", 404);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.project.delete({ where: { id: params.id } });
    return jsonOk({ ok: true });
  } catch {
    return jsonError("Not found", 404);
  }
}
