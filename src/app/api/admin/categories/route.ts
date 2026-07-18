import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api-utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { projects: true } } },
  });
  return jsonOk(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.labelAr || !body.labelEn) {
    return jsonError("labelAr and labelEn are required");
  }
  const slug = (body.slug || body.labelEn)
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const maxOrder = await prisma.category.aggregate({ _max: { order: true } });

  const category = await prisma.category.create({
    data: {
      slug,
      order: (maxOrder._max.order ?? -1) + 1,
      isContact: !!body.isContact,
      colorFrom: body.colorFrom ?? "#2f9bf5",
      colorTo: body.colorTo ?? "#8b5cf6",
      glowColorHex: body.glowColorHex ?? "#2f9bf5",
      image: body.image ?? null,
      labelAr: body.labelAr,
      labelEn: body.labelEn,
      greetTitleAr: body.greetTitleAr ?? null,
      greetTitleEn: body.greetTitleEn ?? null,
      greetTextAr: body.greetTextAr ?? null,
      greetTextEn: body.greetTextEn ?? null,
    },
  });
  return jsonOk(category, 201);
}
