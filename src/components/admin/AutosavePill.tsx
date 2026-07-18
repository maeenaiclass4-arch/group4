"use client";

import { useAdminI18n } from "@/lib/admin-i18n";

export type SaveState = "idle" | "saving" | "saved";

export default function AutosavePill({ state }: { state: SaveState }) {
  const { t } = useAdminI18n();
  if (state === "idle") return null;
  return (
    <div className={"autosave-pill show" + (state === "saved" ? " saved" : "")}>
      <span className="autosave-dot"></span>
      {state === "saving" ? t("common_autosaving") : t("common_autosaved")}
    </div>
  );
}
