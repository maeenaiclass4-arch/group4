"use client";

import { useEffect, useMemo, useState } from "react";
import type { CategoryDTO, Lang, SiteSettingsDTO } from "@/lib/types";
import { hexToRgba } from "@/lib/types";
import DocGenerator from "./DocGenerator";

const FLAG_SVG: Record<"gb" | "sa", string> = {
  gb: '<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#012169"/><path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" stroke-width="8"/><path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" stroke-width="4"/><rect x="25" width="10" height="40" fill="#fff"/><rect y="15" width="60" height="10" fill="#fff"/><rect x="27" width="6" height="40" fill="#C8102E"/><rect y="17" width="60" height="6" fill="#C8102E"/></svg>',
  sa: '<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#165d31"/><path d="M14 15 q4 -6 8 0 t8 0 t8 0 t8 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="13" y="25" width="34" height="3.6" rx="1.8" fill="#fff"/><rect x="42" y="23.5" width="6" height="6.6" rx="1.6" fill="#fff"/></svg>',
};

const STR = {
  ar: {
    eyebrowFallback: "بورتفوليو احترافي",
    preview: "معاينة المشروع",
    sectionLabel: "أعمال سابقة",
    langLabel: "EN",
  },
  en: {
    eyebrowFallback: "Professional Portfolio",
    preview: "Project preview",
    sectionLabel: "Selected Work",
    langLabel: "AR",
  },
};

export default function PortfolioApp({
  categories,
  settings,
}: {
  categories: CategoryDTO[];
  settings: SiteSettingsDTO;
}) {
  const [lang, setLang] = useState<Lang>("ar");
  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? "");
  const [shrink, setShrink] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer:coarse)").matches);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShrink(window.scrollY > 40);
        setShowTop(window.scrollY > 500);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeCategory = useMemo(() => categories.find((c) => c.id === activeId), [categories, activeId]);
  const s = STR[lang];

  function toggleLang() {
    setSwitching(true);
    setTimeout(() => setSwitching(false), 600);
    setLang((l) => (l === "ar" ? "en" : "ar"));
  }

  const heroTitle = lang === "ar" ? settings.heroTitleAr : settings.heroTitleEn;
  const heroSub = lang === "ar" ? settings.heroSubAr : settings.heroSubEn;
  const eyebrow = (lang === "ar" ? settings.eyebrowAr : settings.eyebrowEn) || s.eyebrowFallback;
  const footerText = lang === "ar" ? settings.footerAr : settings.footerEn;
  const sectionLabel = (lang === "ar" ? settings.sectionLabelAr : settings.sectionLabelEn) || s.sectionLabel;
  const previewText = (lang === "ar" ? settings.previewAr : settings.previewEn) || s.preview;

  return (
    <>
      <header className={shrink ? "shrink" : ""}>
        <div className="header-inner wrap">
          <button className={"lang-toggle" + (isTouch ? " is-mobile" : " is-desktop") + (switching ? " switching" : "")} onClick={toggleLang}>
            <span
              className="flag"
              dangerouslySetInnerHTML={{ __html: FLAG_SVG[lang === "ar" ? "gb" : "sa"] }}
            />
            <span>{s.langLabel}</span>
          </button>
          {settings.logo && <img className="logo-big" src={settings.logo} alt="YAZ" />}
          <nav className="tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={"tab-btn" + (cat.id === activeId ? " active" : "")}
                style={
                  {
                    "--tab-color": `linear-gradient(135deg, ${cat.colorFrom}, ${cat.colorTo})`,
                    "--tab-glow": hexToRgba(cat.glowColorHex, 0.5),
                  } as React.CSSProperties
                }
                onClick={() => setActiveId(cat.id)}
              >
                {lang === "ar" ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="wrap">
        <section className="hero">
          <div className="eyebrow">
            <span className="chev"></span>
            <span>{eyebrow}</span>
          </div>
          <h1 dangerouslySetInnerHTML={{ __html: heroTitle }} />
          <p>{heroSub}</p>
        </section>

        <div className="divider">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div id="panels">
          {categories.map((cat) => (
            <Panel
              key={cat.id}
              cat={cat}
              active={cat.id === activeId}
              lang={lang}
              settings={settings}
              sectionLabel={sectionLabel}
              previewText={previewText}
            />
          ))}
        </div>
      </div>

      <footer>
        <div className="wrap">
          <div className="brand-line">
            {settings.logo && <img src={settings.logo} alt="YAZ" />} YAZ
          </div>
          <span>{footerText}</span>
        </div>
      </footer>

      <button
        className={"to-top" + (showTop ? " show" : "")}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
    </>
  );
}

function Panel({
  cat,
  active,
  lang,
  settings,
  sectionLabel,
  previewText,
}: {
  cat: CategoryDTO;
  active: boolean;
  lang: Lang;
  settings: SiteSettingsDTO;
  sectionLabel: string;
  previewText: string;
}) {
  const glowSoft = `radial-gradient(circle, ${hexToRgba(cat.glowColorHex, 0.3)}, transparent 70%)`;

  if (cat.isContact) {
    return (
      <div className={"panel" + (active ? " active" : "")} style={{ "--tab-glow-soft": glowSoft } as React.CSSProperties}>
        <div className="contact-card">
          {settings.logo && <img src={settings.logo} alt="YAZ" />}
          <h2>{lang === "ar" ? settings.contactTitleAr : settings.contactTitleEn}</h2>
          <p>{lang === "ar" ? settings.contactTextAr : settings.contactTextEn}</p>
          <a className="contact-email" href={`mailto:${settings.contactEmail}`}>
            {lang === "ar" ? settings.contactEmailLabelAr : settings.contactEmailLabelEn}
          </a>
          <div className="contact-socials">
            {settings.socialInstagram && <a href={settings.socialInstagram}>Instagram</a>}
            {settings.socialBehance && <a href={settings.socialBehance}>Behance</a>}
            {settings.socialLinkedin && <a href={settings.socialLinkedin}>LinkedIn</a>}
            {settings.socialX && <a href={settings.socialX}>X</a>}
          </div>
        </div>
      </div>
    );
  }

  const label = lang === "ar" ? cat.labelAr : cat.labelEn;

  return (
    <div className={"panel" + (active ? " active" : "")} style={{ "--tab-glow-soft": glowSoft } as React.CSSProperties}>
      <div className="char-panel">
        <div className="char-glow"></div>
        {cat.image && <img src={cat.image} alt={label} />}
      </div>
      <div className="content-panel">
        <div className="speech">
          <h2>{lang === "ar" ? cat.greetTitleAr : cat.greetTitleEn}</h2>
          <p>{lang === "ar" ? cat.greetTextAr : cat.greetTextEn}</p>
        </div>
        <div className="section-label">
          {sectionLabel}
          <span className="line"></span>
        </div>
        <div className="portfolio-grid">
          {cat.projects.map((p) => {
            const title = lang === "ar" ? p.titleAr : p.titleEn;
            const desc = lang === "ar" ? p.descAr : p.descEn;
            const catLabel = (lang === "ar" ? p.catLabelAr : p.catLabelEn) || label;
            return (
              <div key={p.id} className={"p-card" + (p.image ? " has-img" : "")}>
                <div className={"p-thumb" + (p.image ? " has-img" : "")}>
                  {p.image ? <img src={p.image} alt={title} loading="lazy" /> : previewText}
                </div>
                <div className="p-body">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <div className="p-meta">
                    <span className="p-tag">{catLabel}</span>
                    {p.softTag && <span className="p-soft">{p.softTag}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {cat.slug === "video" && <DocGenerator lang={lang} />}
      </div>
    </div>
  );
}
