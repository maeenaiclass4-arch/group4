import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const featured = searchParams.get("featured");
  const tag = searchParams.get("tag");
  const search = searchParams.get("q");

  const projects = await prisma.project.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(featured ? { featured: featured === "true" } : {}),
      ...(tag ? { tags: { some: { slug: tag } } } : {}),
      ...(search
        ? {
            OR: [
              { titleAr: { contains: search } },
              { titleEn: { contains: search } },
              { descAr: { contains: search } },
              { descEn: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: [{ categoryId: "asc" }, { order: "asc" }],
    include: { category: true, tags: true },
  });
  return jsonOk(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.categoryId || !body.titleAr || !body.titleEn) {
    return jsonError("categoryId, titleAr, titleEn are required");
  }

  const maxOrder = await prisma.project.aggregate({
    _max: { order: true },
    where: { categoryId: body.categoryId },
  });

  const project = await prisma.project.create({
    data: {
      categoryId: body.categoryId,
      order: (maxOrder._max.order ?? -1) + 1,
      featured: !!body.featured,
      published: body.published ?? true,
      titleAr: body.titleAr,
      titleEn: body.titleEn,
      descAr: body.descAr ?? "",
      descEn: body.descEn ?? "",
      image: body.image ?? null,
      video: body.video ?? null,
      link: body.link ?? null,
      softTag: body.softTag ?? null,
      catLabelAr: body.catLabelAr ?? null,
      catLabelEn: body.catLabelEn ?? null,
      tags: body.tagIds ? { connect: body.tagIds.map((id: string) => ({ id })) } : undefined,
    },
    include: { tags: true, category: true },
  });
  return jsonOk(project, 201);
}
