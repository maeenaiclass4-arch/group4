import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items: { id: string; order: number }[] = body.items;
  if (!Array.isArray(items)) return jsonError("items array required");

  await prisma.$transaction(
    items.map((item) => prisma.category.update({ where: { id: item.id }, data: { order: item.order } }))
  );
  revalidatePath("/");
  return jsonOk({ ok: true });
}
