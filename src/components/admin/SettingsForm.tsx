"use client";

import { useEffect, useState } from "react";
import Topbar from "./Topbar";
import Dropzone from "./Dropzone";
import AutosavePill from "./AutosavePill";
import { useAdminI18n } from "@/lib/admin-i18n";
import { useAutosave } from "@/lib/use-autosave";

interface SettingsData {
  logo: string | null;
  eyebrowAr: string;
  eyebrowEn: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubAr: string;
  heroSubEn: string;
  sectionLabelAr: string;
  sectionLabelEn: string;
  previewAr: string;
  previewEn: string;
  footerAr: string;
  footerEn: string;
  contactTitleAr: string;
  contactTitleEn: string;
  contactTextAr: string;
  contactTextEn: string;
  contactEmail: string;
  contactEmailLabelAr: string;
  contactEmailLabelEn: string;
  socialInstagram: string;
  socialBehance: string;
  socialLinkedin: string;
  socialX: string;
}

const EMPTY: SettingsData = {
  logo: null,
  eyebrowAr: "",
  eyebrowEn: "",
  heroTitleAr: "",
  heroTitleEn: "",
  heroSubAr: "",
  heroSubEn: "",
  sectionLabelAr: "",
  sectionLabelEn: "",
  previewAr: "",
  previewEn: "",
  footerAr: "",
  footerEn: "",
  contactTitleAr: "",
  contactTitleEn: "",
  contactTextAr: "",
  contactTextEn: "",
  contactEmail: "",
  contactEmailLabelAr: "",
  contactEmailLabelEn: "",
  socialInstagram: "",
  socialBehance: "",
  socialLinkedin: "",
  socialX: "",
};

export default function SettingsForm() {
  const { t } = useAdminI18n();
  const [data, setData] = useState<SettingsData>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((s) => {
        if (s)
          setData({
            ...EMPTY,
            ...s,
            socialInstagram: s.socialInstagram ?? "",
            socialBehance: s.socialBehance ?? "",
            socialLinkedin: s.socialLinkedin ?? "",
            socialX: s.socialX ?? "",
          });
        setLoaded(true);
      });
  }, []);

  const saveState = useAutosave(
    data,
    async (d) => {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
    },
    800
  );

  function update<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  if (!loaded) return <div className="admin-content">{t("common_loading")}</div>;

  return (
    <>
      <AutosavePill state={saveState} />
      <Topbar title={t("settings_title")} subtitle={t("settings_subtitle")} />
      <div className="admin-content">
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="field">
            <label>Logo</label>
            <Dropzone value={data.logo} onChange={(url) => update("logo", url)} accept="image/*" kind="image" />
          </div>
          <div className="field">
            <label>Contact email</label>
            <input className="input" type="email" value={data.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Instagram URL</label>
              <input className="input" value={data.socialInstagram} onChange={(e) => update("socialInstagram", e.target.value)} />
            </div>
            <div className="field">
              <label>Behance URL</label>
              <input className="input" value={data.socialBehance} onChange={(e) => update("socialBehance", e.target.value)} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>LinkedIn URL</label>
              <input className="input" value={data.socialLinkedin} onChange={(e) => update("socialLinkedin", e.target.value)} />
            </div>
            <div className="field">
              <label>X (Twitter) URL</label>
              <input className="input" value={data.socialX} onChange={(e) => update("socialX", e.target.value)} />
            </div>
          </div>
        </div>

        <BilingualBlock title="Eyebrow" arKey="eyebrowAr" enKey="eyebrowEn" data={data} update={update} textarea={false} />
        <BilingualBlock title="Hero title (HTML allowed)" arKey="heroTitleAr" enKey="heroTitleEn" data={data} update={update} textarea />
        <BilingualBlock title="Hero subtitle" arKey="heroSubAr" enKey="heroSubEn" data={data} update={update} textarea />
        <BilingualBlock title="Section label" arKey="sectionLabelAr" enKey="sectionLabelEn" data={data} update={update} textarea={false} />
        <BilingualBlock title="Empty project preview text" arKey="previewAr" enKey="previewEn" data={data} update={update} textarea={false} />
        <BilingualBlock title="Footer text" arKey="footerAr" enKey="footerEn" data={data} update={update} textarea={false} />
        <BilingualBlock title="Contact title" arKey="contactTitleAr" enKey="contactTitleEn" data={data} update={update} textarea={false} />
        <BilingualBlock title="Contact text" arKey="contactTextAr" enKey="contactTextEn" data={data} update={update} textarea />
        <BilingualBlock title="Contact email button label" arKey="contactEmailLabelAr" enKey="contactEmailLabelEn" data={data} update={update} textarea={false} />
      </div>
    </>
  );
}

function BilingualBlock({
  title,
  arKey,
  enKey,
  data,
  update,
  textarea,
}: {
  title: string;
  arKey: keyof SettingsData;
  enKey: keyof SettingsData;
  data: SettingsData;
  update: <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => void;
  textarea: boolean;
}) {
  return (
    <div className="lang-split">
      <div>
        <div className="lang-split-col-title">🇸🇦 {title}</div>
        {textarea ? (
          <textarea className="textarea" dir="rtl" value={data[arKey] as string} onChange={(e) => update(arKey, e.target.value as any)} />
        ) : (
          <input className="input" dir="rtl" value={data[arKey] as string} onChange={(e) => update(arKey, e.target.value as any)} />
        )}
      </div>
      <div>
        <div className="lang-split-col-title">🇬🇧 {title}</div>
        {textarea ? (
          <textarea className="textarea" dir="ltr" value={data[enKey] as string} onChange={(e) => update(enKey, e.target.value as any)} />
        ) : (
          <input className="input" dir="ltr" value={data[enKey] as string} onChange={(e) => update(enKey, e.target.value as any)} />
        )}
      </div>
    </div>
  );
}
