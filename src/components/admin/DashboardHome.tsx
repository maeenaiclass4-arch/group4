"use client";

import Link from "next/link";
import Topbar from "./Topbar";
import { useAdminI18n } from "@/lib/admin-i18n";

export default function DashboardHome({
  stats,
}: {
  stats: { totalProjects: number; totalCategories: number; featuredProjects: number; totalMedia: number };
}) {
  const { t } = useAdminI18n();

  return (
    <>
      <Topbar title={t("dashboard_welcome")} subtitle={t("dashboard_subtitle")} />
      <div className="admin-content">
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalProjects}</div>
            <div className="stat-label">{t("dashboard_totalProjects")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalCategories}</div>
            <div className="stat-label">{t("dashboard_totalCategories")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.featuredProjects}</div>
            <div className="stat-label">{t("dashboard_featuredProjects")}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalMedia}</div>
            <div className="stat-label">{t("dashboard_totalMedia")}</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16, fontFamily: "Sora,sans-serif" }}>{t("dashboard_quickActions")}</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/admin/projects/new" className="btn btn-primary">
              ＋ {t("dashboard_addProject")}
            </Link>
            <Link href="/admin/categories" className="btn btn-ghost">
              🗂️ {t("dashboard_manageCategories")}
            </Link>
            <Link href="/admin/settings" className="btn btn-ghost">
              ⚙️ {t("dashboard_editSettings")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
