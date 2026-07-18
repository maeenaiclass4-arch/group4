"use client";

import { useAdminI18n } from "@/lib/admin-i18n";

export default function Topbar({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  const { lang, setLang, t } = useAdminI18n();

  return (
    <div className="admin-topbar">
      <div>
        <div className="admin-page-title">{title}</div>
        {subtitle && <div className="admin-page-subtitle">{subtitle}</div>}
      </div>
      <div className="admin-topbar-actions">
        {actions}
        <button className="btn btn-ghost btn-sm" onClick={() => setLang(lang === "ar" ? "en" : "ar")}>
          {lang === "ar" ? t("common_english") : t("common_arabic")}
        </button>
      </div>
    </div>
  );
}
