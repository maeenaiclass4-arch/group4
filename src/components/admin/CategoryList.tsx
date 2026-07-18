"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "./Topbar";
import SortableList from "./SortableList";
import { useAdminI18n } from "@/lib/admin-i18n";

interface CategoryRow {
  id: string;
  slug: string;
  order: number;
  labelAr: string;
  labelEn: string;
  image: string | null;
  isContact: boolean;
  published: boolean;
  colorFrom: string;
  colorTo: string;
  _count: { projects: number };
}

export default function CategoryList() {
  const { t, lang } = useAdminI18n();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    setCategories(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReorder(newItems: CategoryRow[]) {
    setCategories(newItems);
    const items = newItems.map((c, i) => ({ id: c.id, order: i }));
    await fetch("/api/admin/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  }

  async function togglePublished(cat: CategoryRow) {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, published: !c.published } : c)));
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !cat.published }),
    });
  }

  async function handleDelete(cat: CategoryRow) {
    if (!confirm(t("common_confirmDelete"))) return;
    await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
  }

  return (
    <>
      <Topbar
        title={t("categories_title")}
        subtitle={t("categories_subtitle")}
        actions={
          <Link href="/admin/categories/new" className="btn btn-primary btn-sm">
            ＋ {t("categories_addNew")}
          </Link>
        }
      />
      <div className="admin-content">
        <div className="card" style={{ padding: 8 }}>
          {loading ? (
            <div className="empty-state">{t("common_loading")}</div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🗂️</div>
              {t("common_noResults")}
            </div>
          ) : (
            <SortableList items={categories} onReorder={handleReorder}>
              {(cat, _index, handleProps) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span className="drag-handle" {...handleProps}>
                    ⠿
                  </span>
                  {cat.image ? (
                    <img className="thumb-sm" src={cat.image} alt="" />
                  ) : (
                    <div className="thumb-sm" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {cat.isContact ? "✉️" : "🗂️"}
                    </div>
                  )}
                  <div
                    style={{
                      width: 4,
                      height: 34,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${cat.colorFrom}, ${cat.colorTo})`,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{lang === "ar" ? cat.labelAr : cat.labelEn}</div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                      /{cat.slug} · {cat._count.projects} {t("nav_projects")}
                    </div>
                  </div>
                  <button
                    className={"toggle" + (cat.published ? " on" : "")}
                    onClick={() => togglePublished(cat)}
                    type="button"
                    title={cat.published ? t("common_published") : t("common_draft")}
                  >
                    <span className="toggle-track"></span>
                  </button>
                  <Link href={`/admin/categories/${cat.id}`} className="btn btn-ghost btn-sm">
                    {t("common_edit")}
                  </Link>
                  {!cat.isContact && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat)} type="button">
                      {t("common_delete")}
                    </button>
                  )}
                </div>
              )}
            </SortableList>
          )}
        </div>
      </div>
    </>
  );
}
