"use client";

import { useRef, useState } from "react";
import type { Lang } from "@/lib/types";

const DG_STR = {
  ar: {
    badge: "ميزة مدعومة بالذكاء الاصطناعي",
    title: 'مولّد الأفلام <span class="accent">الوثائقية</span> بالذكاء الاصطناعي',
    desc: "اكتب أي موضوع، وسيبني محرك YAZ AI حزمة إنتاج وثائقي متكاملة: بحث موثّق، سيناريو، تخطيط مشاهد، برومبتات صور وفيديو، وملاحظات إنتاج جاهزة للتنفيذ.",
    placeholder: "اكتب أي موضوع وثائقي...",
    tryLabel: "جرّب:",
    suggestions: ["ليونيل ميسي", "الحرب العالمية الثانية", "الذكاء الاصطناعي", "SpaceX", "كريستيانو رونالدو"],
    generate: "🎬 توليد الحزمة",
    steps: [
      "تهيئة محرك الذكاء الاصطناعي",
      "الاتصال بفريق البحث",
      "البحث في المصادر",
      "التحقق من الحقائق",
      "بناء الوثائقي",
      "كتابة السيناريو",
      "تخطيط المشاهد",
      "تجهيز حزمة الإنتاج",
    ],
    status: "YAZ AI يعمل الآن",
    readyTitle: "حزمة الإنتاج جاهزة ✓",
    readySub: (t: string) => `وثائقي: «${t}» — ٦ مخرجات قابلة للتوسيع`,
    reset: "موضوع جديد",
    cards: (t: string) => [
      { i: "📄", h: "البحث", b: `<strong>ملخص البحث حول ${t}:</strong> جمع المحرك أبرز الحقائق والخلفية التاريخية والسياق العام للموضوع من مصادر متعددة.<ul><li>نبذة تعريفية وخط زمني لأهم المحطات.</li><li>أرقام وإحصائيات محورية تدعم السرد.</li><li>اقتباسات وشهادات مقترحة للمقابلات.</li><li>قائمة مصادر مرشّحة للتوثيق والمراجعة.</li></ul>` },
      { i: "📝", h: "السيناريو", b: `<strong>هيكل سيناريو من ٣ فصول:</strong><ul><li><strong>الافتتاحية (٠-٢ د):</strong> خطاف سردي قوي يقدّم ${t} بسؤال يشدّ المشاهد.</li><li><strong>الفصل الأول:</strong> الخلفية والنشأة — كيف بدأت القصة.</li><li><strong>الفصل الثاني:</strong> نقطة التحول والصراع المحوري.</li><li><strong>الفصل الثالث:</strong> الذروة، الأثر، والخاتمة التأملية.</li><li>تعليق صوتي مكتوب بنبرة سينمائية مع فواصل طبيعية.</li></ul>` },
      { i: "🎬", h: "تخطيط المشاهد", b: `<strong>قائمة مشاهد مقترحة (${t}):</strong><ul><li>مشهد افتتاحي جوي/واسع يؤسس المكان والزمان.</li><li>لقطات أرشيفية أو إعادة تمثيل للمحطات الرئيسية.</li><li>مقابلات بإضاءة درامية وخلفية معتمة.</li><li>لقطات مقرّبة للتفاصيل (B-Roll) لتغطية المونتاج.</li><li>مشهد ختامي بطيء مع تلاشي تدريجي للموسيقى.</li></ul>` },
      { i: "🖼", h: "برومبتات الصور", b: `<strong>برومبتات جاهزة لتوليد الصور:</strong><ul><li>"Cinematic wide shot related to ${t}, dramatic lighting, 8K, film grain"</li><li>"Close-up detail shot, shallow depth of field, moody documentary style"</li><li>"Archival-style photograph, ${t}, muted colors, 35mm film look"</li><li>"Epic establishing shot, golden hour, anamorphic lens"</li></ul>` },
      { i: "🎥", h: "برومبتات الفيديو", b: `<strong>برومبتات لمقاطع فيديو مولّدة:</strong><ul><li>"Slow dolly-in on subject, ${t} theme, cinematic documentary, 24fps"</li><li>"Aerial drone flyover, atmospheric haze, epic scale"</li><li>"Timelapse sequence showing progression, dramatic clouds"</li><li>"Handheld tracking shot, raw documentary feel, natural light"</li></ul>` },
      { i: "🎵", h: "ملاحظات الإنتاج", b: `<strong>توجيهات الإنتاج النهائية:</strong><ul><li><strong>الموسيقى:</strong> مقطوعات أوركسترالية هادئة تتصاعد مع الذروة.</li><li><strong>الألوان:</strong> تدرّج سينمائي (Teal & Orange) مع تباين ناعم.</li><li><strong>الإيقاع:</strong> قطعات بطيئة في السرد، أسرع في نقاط التحول.</li><li><strong>الصوت:</strong> تصميم صوتي محيطي + تعليق صوتي دافئ.</li><li><strong>المدة المقترحة:</strong> ١٢-١٨ دقيقة بصيغة 4K.</li></ul>` },
    ],
  },
  en: {
    badge: "AI-POWERED FEATURE",
    title: 'AI <span class="accent">Documentary</span> Generator',
    desc: "Type any topic and the YAZ AI engine builds a complete documentary production package: verified research, script, scene planning, image & video prompts, and ready-to-shoot production notes.",
    placeholder: "Enter any documentary topic...",
    tryLabel: "Try:",
    suggestions: ["Lionel Messi", "World War II", "Artificial Intelligence", "SpaceX", "Cristiano Ronaldo"],
    generate: "🎬 Generate Package",
    steps: [
      "Initializing AI Engine",
      "Connecting Research Team",
      "Researching Sources",
      "Fact Checking",
      "Building Documentary",
      "Writing Script",
      "Planning Scenes",
      "Preparing Production Package",
    ],
    status: "YAZ AI IS WORKING",
    readyTitle: "Production package ready ✓",
    readySub: (t: string) => `Documentary: "${t}" — 6 expandable deliverables`,
    reset: "New topic",
    cards: (t: string) => [
      { i: "📄", h: "Research", b: `<strong>Research brief on ${t}:</strong> the engine compiled key facts, historical background, and overall context from multiple sources.<ul><li>Overview and timeline of major milestones.</li><li>Core figures and statistics that support the narrative.</li><li>Suggested quotes and interview testimonies.</li><li>Candidate source list for verification.</li></ul>` },
      { i: "📝", h: "Script", b: `<strong>Three-act script structure:</strong><ul><li><strong>Cold open (0–2 min):</strong> a strong narrative hook introducing ${t} through a compelling question.</li><li><strong>Act I:</strong> origins and background — how the story begins.</li><li><strong>Act II:</strong> the turning point and central conflict.</li><li><strong>Act III:</strong> climax, impact, and a reflective closing.</li><li>Voice-over written in a cinematic tone with natural pauses.</li></ul>` },
      { i: "🎬", h: "Scene Planning", b: `<strong>Proposed shot list (${t}):</strong><ul><li>Wide/aerial opening scene establishing time and place.</li><li>Archival footage or reenactments of key milestones.</li><li>Interviews with dramatic lighting on a dark backdrop.</li><li>Detail close-ups (B-Roll) for edit coverage.</li><li>Slow closing scene with a gradual music fade.</li></ul>` },
      { i: "🖼", h: "Image Prompts", b: `<strong>Ready-to-use image generation prompts:</strong><ul><li>"Cinematic wide shot related to ${t}, dramatic lighting, 8K, film grain"</li><li>"Close-up detail shot, shallow depth of field, moody documentary style"</li><li>"Archival-style photograph, ${t}, muted colors, 35mm film look"</li><li>"Epic establishing shot, golden hour, anamorphic lens"</li></ul>` },
      { i: "🎥", h: "Video Prompts", b: `<strong>Prompts for generated video clips:</strong><ul><li>"Slow dolly-in on subject, ${t} theme, cinematic documentary, 24fps"</li><li>"Aerial drone flyover, atmospheric haze, epic scale"</li><li>"Timelapse sequence showing progression, dramatic clouds"</li><li>"Handheld tracking shot, raw documentary feel, natural light"</li></ul>` },
      { i: "🎵", h: "Production Notes", b: `<strong>Final production direction:</strong><ul><li><strong>Music:</strong> restrained orchestral cues building toward the climax.</li><li><strong>Color:</strong> cinematic teal & orange grade with soft contrast.</li><li><strong>Pacing:</strong> slower cuts for narration, faster at turning points.</li><li><strong>Sound:</strong> ambient sound design + warm voice-over.</li><li><strong>Target runtime:</strong> 12–18 minutes, delivered in 4K.</li></ul>` },
    ],
  },
} as const;

type Step = { label: string; state: "idle" | "active" | "done" };
type CardData = { i: string; h: string; b: string };

export default function DocGenerator({ lang }: { lang: Lang }) {
  const d = DG_STR[lang];
  const [topic, setTopic] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<Step[]>(d.steps.map((label) => ({ label, state: "idle" })));
  const [fill, setFill] = useState(0);
  const [results, setResults] = useState<{ topic: string; cards: CardData[] } | null>(null);
  const [openCard, setOpenCard] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const loaderRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function generate() {
    const t = topic.trim();
    if (!t) {
      setError(true);
      return;
    }
    clearTimers();
    setError(false);
    setLoading(true);
    setResults(null);
    const freshSteps = d.steps.map((label) => ({ label, state: "idle" as const }));
    setSteps(freshSteps);
    setFill(0);
    requestAnimationFrame(() => loaderRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));

    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let time = 300;
    const total = freshSteps.length;
    freshSteps.forEach((_, i) => {
      const dur = reduce ? 120 : 650 + Math.random() * 450;
      timers.current.push(
        setTimeout(() => {
          setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, state: "active" } : idx < i ? { ...s, state: "done" } : { ...s, state: "idle" })));
          setFill(Math.round(((i + 1) / total) * 100));
        }, time)
      );
      time += dur;
      timers.current.push(
        setTimeout(() => {
          setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, state: "done" } : s)));
        }, time)
      );
    });

    timers.current.push(
      setTimeout(() => {
        setLoading(false);
        setResults({ topic: t, cards: d.cards(t) as unknown as CardData[] });
        requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
      }, time + 350)
    );
  }

  function reset() {
    clearTimers();
    setResults(null);
    setLoading(false);
    setTopic("");
    setError(false);
  }

  return (
    <div className="dg" id="dgRoot">
      <div className="dg-inner">
        <span className="dg-badge">
          <span className="dot"></span>
          {d.badge}
        </span>
        <h2 dangerouslySetInnerHTML={{ __html: `🎬 ${d.title}` }} />
        <p className="dg-desc">{d.desc}</p>

        <div className="dg-form">
          <input
            className={"dg-input" + (error ? " dg-error" : "")}
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") generate();
            }}
            type="text"
            placeholder={d.placeholder}
            autoComplete="off"
          />
          <button className="dg-generate" onClick={generate} disabled={loading}>
            {d.generate}
          </button>
        </div>
        <div className="dg-try">
          <span className="dg-try-label">{d.tryLabel}</span>
          {d.suggestions.map((s) => (
            <button
              key={s}
              className="dg-chip"
              onClick={() => setTopic(s)}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>

        <div className={"dg-loader" + (loading ? " active" : "")} ref={loaderRef} aria-live="polite">
          <div className="dg-progress">
            <div className="dg-progress-fill" style={{ width: `${fill}%` }}></div>
          </div>
          <div className="dg-steps">
            {steps.map((s, i) => (
              <div key={i} className={"dg-step" + (s.state === "active" ? " active" : s.state === "done" ? " done" : "")}>
                <span className="dg-ico"></span>
                <span>{s.label}...</span>
              </div>
            ))}
          </div>
          <div className="dg-status">{d.status}</div>
        </div>

        <div className={"dg-results" + (results ? " active" : "")} ref={resultsRef}>
          {results && (
            <>
              <div className="dg-results-head">
                <div className="dg-results-title">
                  <h3>{d.readyTitle}</h3>
                  <p>{d.readySub(results.topic)}</p>
                </div>
                <button className="dg-reset" onClick={reset} type="button">
                  {d.reset}
                </button>
              </div>
              <div className="dg-grid">
                {results.cards.map((c, i) => (
                  <div key={i} className={"dg-card" + (openCard === i ? " open" : "")} style={{ animationDelay: `${i * 90}ms` }}>
                    <button
                      className="dg-card-head"
                      aria-expanded={openCard === i}
                      onClick={() => setOpenCard(openCard === i ? null : i)}
                      type="button"
                    >
                      <span className="dg-emoji">{c.i}</span>
                      <h4>{c.h}</h4>
                      <span className="dg-chev">▼</span>
                    </button>
                    <div className="dg-card-body">
                      <div className="dg-card-body-inner" dangerouslySetInnerHTML={{ __html: c.b }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
