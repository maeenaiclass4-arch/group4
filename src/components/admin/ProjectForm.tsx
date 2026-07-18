"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Topbar from "./Topbar";
import Dropzone from "./Dropzone";
import AutosavePill from "./AutosavePill";
import { useAdminI18n } from "@/lib/admin-i18n";
import { useAutosave } from "@/lib/use-autosave";

interface Tag {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
}

interface CategoryOption {
  id: string;
  labelAr: string;
  labelEn: string;
  colorFrom: string;
  colorTo: string;
  glowColorHex: string;
  isContact: boolean;
}

interface ProjectFormData {
  categoryId: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  image: string | null;
  video: string | null;
  softTag: string;
  catLabelAr: string;
  catLabelEn: string;
  featured: boolean;
  published: boolean;
  tagIds: string[];
}

const EMPTY: ProjectFormData = {
  categoryId: "",
  titleAr: "",
  titleEn: "",
  descAr: "",
  descEn: "",
  image: null,
  video: null,
  softTag: "",
  catLabelAr: "",
  catLabelEn: "",
  featured: false,
  published: true,
  tagIds: [],
};

export default function ProjectForm({ id }: { id?: string }) {
  const { t, lang } = useAdminI18n();
  const router = useRouter();
  const [data, setData] = useState<ProjectFormData>(EMPTY);
  const [loaded, setLoaded] = useState(!id);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((cats) => {
        setCategories(cats);
        setData((prev) => (prev.categoryId ? prev : { ...prev, categoryId: cats.find((c: CategoryOption) => !c.isContact)?.id ?? "" }));
      });
    fetch("/api/admin/tags")
      .then((r) => r.json())
      .then(setTags);
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/projects/${id}`)
      .then((r) => r.json())
      .then((p) => {
        setData({
          categoryId: p.categoryId,
          titleAr: p.titleAr,
          titleEn: p.titleEn,
          descAr: p.descAr,
          descEn: p.descEn,
          image: p.image,
          video: p.video,
          softTag: p.softTag ?? "",
          catLabelAr: p.catLabelAr ?? "",
          catLabelEn: p.catLabelEn ?? "",
          featured: p.featured,
          published: p.published,
          tagIds: p.tags.map((tg: Tag) => tg.id),
        });
        setLoaded(true);
      });
  }, [id]);

  const saveState = useAutosave(
    data,
    async (d) => {
      if (!id) return;
      await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
    },
    800
  );

  function update<K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  const saveNow = useCallback(async () => {
    if (!id) return;
    await fetch(`/api/admin/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }, [id, data]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "s") {
        e.preventDefault();
        saveNow();
      }
      if (mod && e.key === "Enter") {
        e.preventDefault();
        update("published", !data.published);
        saveNow();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveNow, data.published]);

  async function handleCreate() {
    setSaving(true);
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      const created = await res.json();
      router.push(`/admin/projects/${created.id}`);
    }
  }

  async function createTag(name: string) {
    const res = await fetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameAr: name, nameEn: name }),
    });
    if (res.ok) {
      const tag = await res.json();
      setTags((prev) => [...prev, tag]);
      update("tagIds", [...data.tagIds, tag.id]);
      setTagInput("");
    }
  }

  function toggleTag(tagId: string) {
    update("tagIds", data.tagIds.includes(tagId) ? data.tagIds.filter((tid) => tid !== tagId) : [...data.tagIds, tagId]);
  }

  if (!loaded) {
    return <div className="admin-content">{t("common_loading")}</div>;
  }

  const activeCategory = categories.find((c) => c.id === data.categoryId);

  return (
    <>
      {id && <AutosavePill state={saveState} />}
      <Topbar
        title={id ? data.titleEn || data.titleAr || t("common_edit") : t("projects_addNew")}
        subtitle={t("editor_keyboardHint")}
        actions={
          <button className="btn btn-ghost btn-sm" onClick={() => router.push("/admin/projects")}>
            ← {t("common_back")}
          </button>
        }
      />
      <div className="admin-content">
        <div className="editor-layout">
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="field-row">
                <div className="field">
                  <label>{t("common_category")}</label>
                  <select className="select" value={data.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {lang === "ar" ? c.labelAr : c.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>{t("editor_toolTag")}</label>
                  <input className="input" value={data.softTag} onChange={(e) => update("softTag", e.target.value)} placeholder="Photoshop, Premiere Pro..." />
                </div>
              </div>

              <div className="field">
                <label>{t("common_image")}</label>
                <Dropzone value={data.image} onChange={(url) => update("image", url)} accept="image/*" kind="image" />
              </div>
              <div className="field">
                <label>{t("common_video")}</label>
                <Dropzone value={data.video} onChange={(url) => update("video", url)} accept="video/*" kind="video" />
              </div>

              <div className="field">
                <label>{t("common_tags")}</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {tags.map((tg) => (
                    <button
                      key={tg.id}
                      type="button"
                      className={"badge " + (data.tagIds.includes(tg.id) ? "badge-featured" : "badge-draft")}
                      style={{ cursor: "pointer", border: "none" }}
                      onClick={() => toggleTag(tg.id)}
                    >
                      {lang === "ar" ? tg.nameAr : tg.nameEn}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="input"
                    placeholder="+ tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim()) {
                        e.preventDefault();
                        createTag(tagInput.trim());
                      }
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 10 }}>
                <button type="button" className={"toggle" + (data.featured ? " on" : "")} onClick={() => update("featured", !data.featured)}>
                  <span className="toggle-track"></span>
                  <span className="toggle-label">★ {data.featured ? t("common_featured") : t("common_notFeatured")}</span>
                </button>
                <button type="button" className={"toggle" + (data.published ? " on" : "")} onClick={() => update("published", !data.published)}>
                  <span className="toggle-track"></span>
                  <span className="toggle-label">{data.published ? t("common_published") : t("common_draft")}</span>
                </button>
              </div>
            </div>

            <div className="lang-split">
              <div>
                <div className="lang-split-col-title">🇸🇦 {t("editor_arabicContent")}</div>
                <div className="field">
                  <label>{t("editor_title")}</label>
                  <input className="input" dir="rtl" value={data.titleAr} onChange={(e) => update("titleAr", e.target.value)} />
                </div>
                <div className="field">
                  <label>{t("editor_description")}</label>
                  <textarea className="textarea" dir="rtl" value={data.descAr} onChange={(e) => update("descAr", e.target.value)} />
                </div>
                <div className="field">
                  <label>{t("editor_subCategoryLabel")}</label>
                  <input className="input" dir="rtl" value={data.catLabelAr} onChange={(e) => update("catLabelAr", e.target.value)} />
                </div>
              </div>
              <div>
                <div className="lang-split-col-title">🇬🇧 {t("editor_englishContent")}</div>
                <div className="field">
                  <label>{t("editor_title")}</label>
                  <input className="input" dir="ltr" value={data.titleEn} onChange={(e) => update("titleEn", e.target.value)} />
                </div>
                <div className="field">
                  <label>{t("editor_description")}</label>
                  <textarea className="textarea" dir="ltr" value={data.descEn} onChange={(e) => update("descEn", e.target.value)} />
                </div>
                <div className="field">
                  <label>{t("editor_subCategoryLabel")}</label>
                  <input className="input" dir="ltr" value={data.catLabelEn} onChange={(e) => update("catLabelEn", e.target.value)} />
                </div>
              </div>
            </div>

            {!id && (
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving || !data.categoryId || !data.titleAr || !data.titleEn}>
                {saving ? t("common_saving") : t("common_create")}
              </button>
            )}
          </div>

          <div className="preview-frame">
            <div className="preview-frame-label">👁 {t("editor_livePreview")}</div>
            {activeCategory && <ProjectCardPreview data={data} category={activeCategory} lang={lang} />}
          </div>
        </div>
      </div>
    </>
  );
}

function ProjectCardPreview({ data, category, lang }: { data: ProjectFormData; category: CategoryOption; lang: "ar" | "en" }) {
  const title = lang === "ar" ? data.titleAr : data.titleEn;
  const desc = lang === "ar" ? data.descAr : data.descEn;
  const catLabel = (lang === "ar" ? data.catLabelAr : data.catLabelEn) || (lang === "ar" ? category.labelAr : category.labelEn);

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className={"p-card" + (data.image ? " has-img" : "")} style={{ maxWidth: 280 }}>
        <div className={"p-thumb" + (data.image ? " has-img" : "")}>
          {data.image ? <img src={data.image} alt={title} /> : "—"}
        </div>
        <div className="p-body">
          <h3>{title || "..."}</h3>
          <p>{desc || "..."}</p>
          <div className="p-meta">
            <span className="p-tag">{catLabel}</span>
            {data.softTag && <span className="p-soft">{data.softTag}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
