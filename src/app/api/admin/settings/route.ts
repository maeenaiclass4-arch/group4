import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  return jsonOk(settings);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const allowed = [
    "logo",
    "eyebrowAr",
    "eyebrowEn",
    "heroTitleAr",
    "heroTitleEn",
    "heroSubAr",
    "heroSubEn",
    "sectionLabelAr",
    "sectionLabelEn",
    "previewAr",
    "previewEn",
    "footerAr",
    "footerEn",
    "contactTitleAr",
    "contactTitleEn",
    "contactTextAr",
    "contactTextEn",
    "contactEmail",
    "contactEmailLabelAr",
    "contactEmailLabelEn",
    "socialInstagram",
    "socialBehance",
    "socialLinkedin",
    "socialX",
  ] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  revalidatePath("/");
  return jsonOk(settings);
}
