"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "./Topbar";
import Dropzone from "./Dropzone";
import AutosavePill from "./AutosavePill";
import { useAdminI18n } from "@/lib/admin-i18n";
import { useAutosave } from "@/lib/use-autosave";
import { hexToRgba } from "@/lib/types";

interface CategoryFormData {
  labelAr: string;
  labelEn: string;
  greetTitleAr: string;
  greetTitleEn: string;
  greetTextAr: string;
  greetTextEn: string;
  colorFrom: string;
  colorTo: string;
  glowColorHex: string;
  image: string | null;
  isContact: boolean;
  published: boolean;
}

const EMPTY: CategoryFormData = {
  labelAr: "",
  labelEn: "",
  greetTitleAr: "",
  greetTitleEn: "",
  greetTextAr: "",
  greetTextEn: "",
  colorFrom: "#2f9bf5",
  colorTo: "#8b5cf6",
  glowColorHex: "#2f9bf5",
  image: null,
  isContact: false,
  published: true,
};

export default function CategoryForm({ id }: { id?: string }) {
  const { t } = useAdminI18n();
  const router = useRouter();
  const [data, setData] = useState<CategoryFormData>(EMPTY);
  const [loaded, setLoaded] = useState(!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/categories/${id}`)
      .then((r) => r.json())
      .then((cat) => {
        setData({
          labelAr: cat.labelAr,
          labelEn: cat.labelEn,
          greetTitleAr: cat.greetTitleAr ?? "",
          greetTitleEn: cat.greetTitleEn ?? "",
          greetTextAr: cat.greetTextAr ?? "",
          greetTextEn: cat.greetTextEn ?? "",
          colorFrom: cat.colorFrom,
          colorTo: cat.colorTo,
          glowColorHex: cat.glowColorHex,
          image: cat.image,
          isContact: cat.isContact,
          published: cat.published,
        });
        setLoaded(true);
      });
  }, [id]);

  const saveState = useAutosave(
    data,
    async (d) => {
      if (!id) return;
      await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
    },
    800
  );

  function update<K extends keyof CategoryFormData>(key: K, value: CategoryFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate() {
    setSaving(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      const created = await res.json();
      router.push(`/admin/categories/${created.id}`);
    }
  }

  if (!loaded) {
    return <div className="admin-content">{t("common_loading")}</div>;
  }

  return (
    <>
      {id && <AutosavePill state={saveState} />}
      <Topbar
        title={id ? data.labelEn || data.labelAr : t("categories_addNew")}
        actions={
          <button className="btn btn-ghost btn-sm" onClick={() => router.push("/admin/categories")}>
            ← {t("common_back")}
          </button>
        }
      />
      <div className="admin-content">
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="field">
            <label>{t("common_image")}</label>
            <Dropzone value={data.image} onChange={(url) => update("image", url)} accept="image/*" kind="image" />
          </div>

          <div className="field-row">
            <div className="field" style={{ marginBottom: 0 }}>
              <label>colorFrom</label>
              <input className="input" type="color" value={data.colorFrom} onChange={(e) => update("colorFrom", e.target.value)} style={{ height: 44 }} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>colorTo</label>
              <input className="input" type="color" value={data.colorTo} onChange={(e) => update("colorTo", e.target.value)} style={{ height: 44 }} />
            </div>
          </div>
          <div className="field">
            <label>Glow color</label>
            <input className="input" type="color" value={data.glowColorHex} onChange={(e) => update("glowColorHex", e.target.value)} style={{ height: 44, maxWidth: 120 }} />
          </div>
          <div
            className="field"
            style={{
              height: 40,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${data.colorFrom}, ${data.colorTo})`,
              boxShadow: `0 6px 20px -6px ${hexToRgba(data.glowColorHex, 0.5)}`,
            }}
          />

          <button
            type="button"
            className={"toggle" + (data.published ? " on" : "")}
            style={{ marginTop: 6 }}
            onClick={() => update("published", !data.published)}
          >
            <span className="toggle-track"></span>
            <span className="toggle-label">{data.published ? t("common_published") : t("common_draft")}</span>
          </button>
        </div>

        <div className="lang-split">
          <div>
            <div className="lang-split-col-title">🇸🇦 {t("editor_arabicContent")}</div>
            <div className="field">
              <label>{t("common_category")} — Label</label>
              <input className="input" dir="rtl" value={data.labelAr} onChange={(e) => update("labelAr", e.target.value)} />
            </div>
            <div className="field">
              <label>{t("editor_title")}</label>
              <input className="input" dir="rtl" value={data.greetTitleAr} onChange={(e) => update("greetTitleAr", e.target.value)} />
            </div>
            <div className="field">
              <label>{t("editor_description")}</label>
              <textarea className="textarea" dir="rtl" value={data.greetTextAr} onChange={(e) => update("greetTextAr", e.target.value)} />
            </div>
          </div>
          <div>
            <div className="lang-split-col-title">🇬🇧 {t("editor_englishContent")}</div>
            <div className="field">
              <label>{t("common_category")} — Label</label>
              <input className="input" dir="ltr" value={data.labelEn} onChange={(e) => update("labelEn", e.target.value)} />
            </div>
            <div className="field">
              <label>{t("editor_title")}</label>
              <input className="input" dir="ltr" value={data.greetTitleEn} onChange={(e) => update("greetTitleEn", e.target.value)} />
            </div>
            <div className="field">
              <label>{t("editor_description")}</label>
              <textarea className="textarea" dir="ltr" value={data.greetTextEn} onChange={(e) => update("greetTextEn", e.target.value)} />
            </div>
          </div>
        </div>

        {!id && (
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving || !data.labelAr || !data.labelEn}>
            {saving ? t("common_saving") : t("common_create")}
          </button>
        )}
      </div>
    </>
  );
}
