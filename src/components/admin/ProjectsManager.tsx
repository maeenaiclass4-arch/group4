"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Topbar from "./Topbar";
import SortableList from "./SortableList";
import { useAdminI18n } from "@/lib/admin-i18n";

interface Tag {
  id: string;
  nameAr: string;
  nameEn: string;
}

interface ProjectRow {
  id: string;
  categoryId: string;
  order: number;
  featured: boolean;
  published: boolean;
  titleAr: string;
  titleEn: string;
  image: string | null;
  video: string | null;
  softTag: string | null;
  tags: Tag[];
  category: { id: string; labelAr: string; labelEn: string; colorFrom: string; colorTo: string };
}

export default function ProjectsManager() {
  const { t, lang } = useAdminI18n();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/projects");
    setProjects(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, ProjectRow["category"]>();
    projects.forEach((p) => map.set(p.categoryId, p.category));
    return Array.from(map.values());
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (categoryFilter && p.categoryId !== categoryFilter) return false;
      if (featuredOnly && !p.featured) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.titleAr.toLowerCase().includes(q) && !p.titleEn.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [projects, categoryFilter, featuredOnly, search]);

  const grouped = useMemo(() => {
    const groups = new Map<string, ProjectRow[]>();
    filtered.forEach((p) => {
      const arr = groups.get(p.categoryId) ?? [];
      arr.push(p);
      groups.set(p.categoryId, arr);
    });
    for (const arr of groups.values()) arr.sort((a, b) => a.order - b.order);
    return groups;
  }, [filtered]);

  const canDrag = !search;

  async function reorderGroup(categoryId: string, newGroupItems: ProjectRow[]) {
    setProjects((prev) => {
      const others = prev.filter((p) => p.categoryId !== categoryId);
      const updated = newGroupItems.map((p, i) => ({ ...p, order: i }));
      return [...others, ...updated];
    });
    const items = newGroupItems.map((p, i) => ({ id: p.id, order: i }));
    await fetch("/api/admin/projects/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  }

  async function toggleField(project: ProjectRow, field: "featured" | "published") {
    setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, [field]: !p[field] } : p)));
    await fetch(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !project[field] }),
    });
  }

  async function handleDelete(project: ProjectRow) {
    if (!confirm(t("common_confirmDelete"))) return;
    await fetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== project.id));
  }

  return (
    <>
      <Topbar
        title={t("projects_title")}
        subtitle={t("projects_subtitle")}
        actions={
          <Link href="/admin/projects/new" className="btn btn-primary btn-sm">
            ＋ {t("projects_addNew")}
          </Link>
        }
      />
      <div className="admin-content">
        <div className="card" style={{ marginBottom: 18, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            className="input"
            placeholder={t("common_search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 220 }}
          />
          <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="">{t("common_all")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === "ar" ? c.labelAr : c.labelEn}
              </option>
            ))}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--muted)", cursor: "pointer" }}>
            <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
            {t("projects_filterFeatured")}
          </label>
        </div>

        {loading ? (
          <div className="empty-state">{t("common_loading")}</div>
        ) : grouped.size === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧩</div>
            {t("common_noResults")}
          </div>
        ) : (
          Array.from(grouped.entries()).map(([categoryId, items]) => {
            const cat = items[0].category;
            return (
              <div key={categoryId} className="card" style={{ padding: 8, marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}>
                  <div style={{ width: 4, height: 20, borderRadius: 4, background: `linear-gradient(135deg, ${cat.colorFrom}, ${cat.colorTo})` }} />
                  <strong style={{ fontSize: 14 }}>{lang === "ar" ? cat.labelAr : cat.labelEn}</strong>
                  <span style={{ fontSize: 12.5, color: "var(--muted)" }}>({items.length})</span>
                </div>
                {canDrag ? (
                  <SortableList items={items} onReorder={(newItems) => reorderGroup(categoryId, newItems)}>
                    {(project, _i, handleProps) => (
                      <ProjectRowView
                        project={project}
                        lang={lang}
                        t={t}
                        handleProps={handleProps}
                        onToggle={toggleField}
                        onDelete={handleDelete}
                      />
                    )}
                  </SortableList>
                ) : (
                  items.map((project) => (
                    <ProjectRowView key={project.id} project={project} lang={lang} t={t} onToggle={toggleField} onDelete={handleDelete} />
                  ))
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function ProjectRowView({
  project,
  lang,
  t,
  handleProps,
  onToggle,
  onDelete,
}: {
  project: ProjectRow;
  lang: "ar" | "en";
  t: (k: any) => string;
  handleProps?: Record<string, unknown>;
  onToggle: (p: ProjectRow, field: "featured" | "published") => void;
  onDelete: (p: ProjectRow) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
      {handleProps ? (
        <span className="drag-handle" {...handleProps}>
          ⠿
        </span>
      ) : (
        <span style={{ width: 20 }} />
      )}
      {project.image ? (
        <img className="thumb-sm" src={project.image} alt="" />
      ) : (
        <div className="thumb-sm" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {project.video ? "🎬" : "🖼️"}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{lang === "ar" ? project.titleAr : project.titleEn}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
          {project.softTag && <span className="badge badge-draft">{project.softTag}</span>}
          {project.tags.map((tag) => (
            <span key={tag.id} className="badge badge-draft">
              {lang === "ar" ? tag.nameAr : tag.nameEn}
            </span>
          ))}
        </div>
      </div>
      <button className={"badge " + (project.featured ? "badge-featured" : "badge-draft")} style={{ cursor: "pointer", border: "none" }} onClick={() => onToggle(project, "featured")}>
        ★ {project.featured ? t("common_featured") : t("common_notFeatured")}
      </button>
      <button
        className={"badge " + (project.published ? "badge-published" : "badge-draft")}
        style={{ cursor: "pointer", border: "none" }}
        onClick={() => onToggle(project, "published")}
      >
        {project.published ? t("common_published") : t("common_draft")}
      </button>
      <Link href={`/admin/projects/${project.id}`} className="btn btn-ghost btn-sm">
        {t("common_edit")}
      </Link>
      <button className="btn btn-danger btn-sm" onClick={() => onDelete(project)} type="button">
        {t("common_delete")}
      </button>
    </div>
  );
}
