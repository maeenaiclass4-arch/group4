import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DashboardHome from "@/components/admin/DashboardHome";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalProjects, totalCategories, featuredProjects, totalMedia] = await Promise.all([
    prisma.project.count(),
    prisma.category.count(),
    prisma.project.count({ where: { featured: true } }),
    prisma.media.count(),
  ]);

  return (
    <DashboardHome
      stats={{ totalProjects, totalCategories, featuredProjects, totalMedia }}
    />
  );
}
