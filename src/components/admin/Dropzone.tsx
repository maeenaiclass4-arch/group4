"use client";

import { useRef, useState } from "react";
import { useAdminI18n } from "@/lib/admin-i18n";

export default function Dropzone({
  value,
  onChange,
  accept = "image/*,video/*",
  kind = "image",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
  kind?: "image" | "video";
}) {
  const { t } = useAdminI18n();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const media = await res.json();
        onChange(media.url);
      }
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (files && files[0]) upload(files[0]);
  }

  return (
    <div>
      <div
        className={"dropzone" + (dragOver ? " drag-over" : "")}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          kind === "video" ? (
            <video className="dropzone-preview" src={value} controls />
          ) : (
            <img className="dropzone-preview" src={value} alt="" />
          )
        ) : null}
        <input ref={inputRef} type="file" accept={accept} onChange={(e) => handleFiles(e.target.files)} />
        <div>{uploading ? t("common_loading") : value ? t("common_edit") : t("common_dragDropHint")}</div>
      </div>
      {value && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 8 }}
          onClick={(e) => {
            e.stopPropagation();
            onChange(null);
          }}
        >
          {t("common_delete")}
        </button>
      )}
    </div>
  );
}
