import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api-utils";

export async function GET() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  return jsonOk(media);
}
