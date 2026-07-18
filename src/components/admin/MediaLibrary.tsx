"use client";

import { useEffect, useRef, useState } from "react";
import Topbar from "./Topbar";
import { useAdminI18n } from "@/lib/admin-i18n";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mime: string;
  size: number;
  kind: string;
  createdAt: string;
}

export default function MediaLibrary() {
  const { t } = useAdminI18n();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/media");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      await fetch("/api/admin/upload", { method: "POST", body: formData });
    }
    setUploading(false);
    load();
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(t("common_confirmDelete"))) return;
    await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((m) => m.id !== item.id));
  }

  function copyUrl(url: string) {
    navigator.clipboard?.writeText(url);
  }

  return (
    <>
      <Topbar
        title={t("media_title")}
        subtitle={t("media_subtitle")}
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            ＋ {uploading ? t("common_loading") : t("common_upload")}
          </button>
        }
      />
      <input ref={inputRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => handleUpload(e.target.files)} />
      <div className="admin-content">
        {loading ? (
          <div className="empty-state">{t("common_loading")}</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🖼️</div>
            {t("common_noResults")}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
            {items.map((item) => (
              <div key={item.id} className="card" style={{ padding: 10 }}>
                {item.kind === "video" ? (
                  <video src={item.url} style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 10 }} muted />
                ) : (
                  <img src={item.url} alt="" style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 10 }} />
                )}
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 8, wordBreak: "break-all" }}>
                  {(item.size / 1024).toFixed(0)} KB
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => copyUrl(item.url)}>
                    📋
                  </button>
                  <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleDelete(item)}>
                    {t("common_delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
