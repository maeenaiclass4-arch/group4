"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useAdminI18n } from "@/lib/admin-i18n";

const NAV = [
  { href: "/admin", icon: "🏠", key: "nav_dashboard" as const, exact: true },
  { href: "/admin/categories", icon: "🗂️", key: "nav_categories" as const },
  { href: "/admin/projects", icon: "🧩", key: "nav_projects" as const },
  { href: "/admin/settings", icon: "⚙️", key: "nav_settings" as const },
  { href: "/admin/media", icon: "🖼️", key: "nav_media" as const },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useAdminI18n();
  const { data: session } = useSession();

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <img src="/uploads/seed/logo.webp" alt="YAZ" />
        {t("appName")}
      </div>
      <nav className="admin-nav">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={"admin-nav-link" + (active ? " active" : "")}>
              <span className="admin-nav-icon">{item.icon}</span>
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
      <div className="admin-sidebar-footer">
        <Link href="/" target="_blank" className="admin-nav-link">
          <span className="admin-nav-icon">↗</span>
          {t("nav_viewSite")}
        </Link>
        <div className="admin-user">
          <span className="admin-user-avatar">{session?.user?.email?.[0]?.toUpperCase() ?? "Y"}</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session?.user?.email}</span>
        </div>
        <button className="admin-nav-link" style={{ width: "100%", textAlign: "start", cursor: "pointer" }} onClick={() => signOut({ callbackUrl: "/admin/login" })}>
          <span className="admin-nav-icon">⏻</span>
          {t("nav_logout")}
        </button>
      </div>
    </aside>
  );
}
