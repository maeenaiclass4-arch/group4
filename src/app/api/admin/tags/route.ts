import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api-utils";

export async function GET() {
  const tags = await prisma.tag.findMany({ orderBy: { nameEn: "asc" } });
  return jsonOk(tags);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.nameAr || !body.nameEn) return jsonError("nameAr and nameEn are required");
  const slug = body.nameEn
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const tag = await prisma.tag.create({
    data: { nameAr: body.nameAr, nameEn: body.nameEn, slug },
  });
  return jsonOk(tag, 201);
}
