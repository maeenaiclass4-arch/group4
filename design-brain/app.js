/* Design Brain — العقل الإبداعي
 * Client-side workflow: takes rough meeting notes and calls the user's own
 * AI provider (Anthropic or OpenAI, key stays in the browser) to produce a
 * strategic analysis, 5 distinct design concepts and a production-ready
 * creative brief. No backend involved.
 */

const STORAGE_KEY = "design-brain:settings";
const LANG_KEY = "design-brain:lang";

const I18N = {
  ar: {
    app_title: "العقل الإبداعي",
    app_subtitle: "من ملاحظات الاجتماع إلى اتجاه إبداعي كامل",
    settings: "الإعدادات",
    settings_title: "إعدادات الاتصال بالذكاء الاصطناعي",
    settings_hint: "مفتاحك يُستخدم مباشرة من متصفحك للاتصال بمزوّد الذكاء الاصطناعي، ولا يُرسل لأي خادم آخر.",
    provider: "المزوّد",
    model: "النموذج",
    api_key: "مفتاح API",
    remember_key: "احفظ هذه الإعدادات في هذا المتصفح فقط",
    close: "إغلاق",
    input_title: "ملاحظاتك من الاجتماع",
    input_hint: "الصق ملاحظاتك كما هي — غير منظمة، جمل قصيرة، نقاط متفرقة. سيتولى العقل الإبداعي الباقي.",
    client_name: "اسم العميل / المشروع (اختياري)",
    notes_placeholder: "مثال: عميل يبغى هوية لمقهى مختص، جو دافي وراقي، الزبائن شباب ومهتمين بالتفاصيل، يبون شي يحس انه أصيل بس عصري، ميزانية محدودة للطباعة، يكرهون اللون الأزرق...",
    generate: "حلّل وابتكر 5 مفاهيم",
    loading: [
      "يقرأ ملاحظاتك...",
      "يستخرج شخصية العلامة والجمهور...",
      "يرسم لوحة المزاج...",
      "يبتكر 5 اتجاهات مختلفة تمامًا...",
      "يكتب البريف الإبداعي..."
    ],
    analysis_title: "📋 التحليل الاستراتيجي",
    concepts_title: "🎨 5 مفاهيم تصميم مختلفة",
    brief_title: "📄 البريف الإبداعي الجاهز للإنتاج",
    copy: "نسخ",
    download: "تنزيل Markdown",
    footer_note: "يعمل هذا المشروع بالكامل من متصفحك، ويتطلب مفتاح API خاص بك.",
    err_no_key: "الرجاء إدخال مفتاح API من قسم الإعدادات أولًا.",
    err_no_notes: "الرجاء كتابة ملاحظات الاجتماع أولًا.",
    err_generic: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: ",
    err_parse: "تم استلام رد من الذكاء الاصطناعي لكن تعذّر تحليله كنتيجة منظمة. النص الخام:",
    copied: "تم النسخ ✓",
    analysis_labels: {
      brand_personality: "شخصية العلامة",
      target_audience: "الجمهور المستهدف",
      goals: "الأهداف",
      mood: "المزاج العام",
      keywords: "الكلمات المفتاحية",
      style: "الأسلوب",
      colors: "الألوان",
      typography: "الطباعة",
      visual_direction: "الاتجاه البصري"
    },
    concept_labels: {
      story: "القصة",
      visual_direction: "الاتجاه البصري",
      layout_idea: "فكرة التخطيط",
      color_palette: "لوحة الألوان",
      typography: "توصية الطباعة",
      references: "مراجع إلهام",
      moodboard_description: "وصف لوحة المزاج",
      ai_image_prompt: "برومبت صورة بالذكاء الاصطناعي",
      illustrator_notes: "ملاحظات إنتاج للمصمم"
    },
    concept_word: "المفهوم"
  },
  en: {
    app_title: "Design Brain",
    app_subtitle: "From meeting notes to a complete creative direction",
    settings: "Settings",
    settings_title: "AI connection settings",
    settings_hint: "Your key is used directly from your browser to call the AI provider — it is never sent anywhere else.",
    provider: "Provider",
    model: "Model",
    api_key: "API Key",
    remember_key: "Remember these settings in this browser only",
    close: "Close",
    input_title: "Your meeting notes",
    input_hint: "Paste your notes as-is — messy, short phrases, scattered points. Design Brain will handle the rest.",
    client_name: "Client / project name (optional)",
    notes_placeholder: "e.g. Client wants a brand identity for a specialty coffee shop, warm and upscale vibe, young detail-oriented audience, wants it to feel authentic yet modern, limited print budget, hates the color blue...",
    generate: "Analyze & generate 5 concepts",
    loading: [
      "Reading your notes...",
      "Extracting brand personality and audience...",
      "Sketching the moodboard...",
      "Inventing 5 completely different directions...",
      "Writing the creative brief..."
    ],
    analysis_title: "📋 Strategic Analysis",
    concepts_title: "🎨 5 Distinct Design Concepts",
    brief_title: "📄 Production-Ready Creative Brief",
    copy: "Copy",
    download: "Download Markdown",
    footer_note: "This tool runs entirely in your browser and requires your own API key.",
    err_no_key: "Please enter an API key in Settings first.",
    err_no_notes: "Please write your meeting notes first.",
    err_generic: "An error occurred while calling the AI provider: ",
    err_parse: "Received a response from the AI but couldn't parse it as structured output. Raw text:",
    copied: "Copied ✓",
    analysis_labels: {
      brand_personality: "Brand Personality",
      target_audience: "Target Audience",
      goals: "Goals",
      mood: "Mood",
      keywords: "Keywords",
      style: "Style",
      colors: "Colors",
      typography: "Typography",
      visual_direction: "Visual Direction"
    },
    concept_labels: {
      story: "Story",
      visual_direction: "Visual Direction",
      layout_idea: "Layout Idea",
      color_palette: "Color Palette",
      typography: "Typography Recommendation",
      references: "References",
      moodboard_description: "Moodboard Description",
      ai_image_prompt: "AI Image Prompt",
      illustrator_notes: "Illustrator Production Notes"
    },
    concept_word: "Concept"
  }
};

let currentLang = localStorage.getItem(LANG_KEY) || "ar";
let loadingTimer = null;

// ---------- i18n ----------

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  const html = document.getElementById("html-root");
  html.setAttribute("lang", lang);
  html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  document.getElementById("lang-toggle").textContent = lang === "ar" ? "EN" : "AR";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const val = I18N[lang][key];
    if (typeof val === "string") el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const val = I18N[lang][key];
    if (typeof val === "string") el.setAttribute("placeholder", val);
  });
}

// ---------- Settings persistence ----------

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s.provider) document.getElementById("provider").value = s.provider;
    if (s.model) document.getElementById("model").value = s.model;
    if (s.apiKey) document.getElementById("api-key").value = s.apiKey;
    document.getElementById("remember-key").checked = true;
  } catch (_) { /* ignore corrupt storage */ }
}

function persistSettingsIfRequested() {
  const remember = document.getElementById("remember-key").checked;
  if (!remember) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    provider: document.getElementById("provider").value,
    model: document.getElementById("model").value,
    apiKey: document.getElementById("api-key").value
  }));
}

// ---------- Prompt building ----------

function buildSystemPrompt(lang) {
  const langDirective = lang === "ar"
    ? "اكتب كل محتوى الإجابة (كل القيم النصية داخل JSON) باللغة العربية الفصحى المبسطة، بأسلوب مدير إبداعي محترف وواثق."
    : "Write all response content (every text value inside the JSON) in English, in the voice of a confident, senior professional Art Director.";

  return `أنت "العقل الإبداعي" (Design Brain) — مدير إبداعي (Art Director) خبير بخبرة أكثر من 15 سنة في بناء الهويات البصرية والاتجاهات الإبداعية لعملاء حقيقيين. مهمتك: تأخذ ملاحظات خام وغير منظمة من اجتماع مع عميل (قد تكون بالعربية أو الإنجليزية أو خليط منهما، وقد تكون عامية) وتحوّلها إلى اتجاه إبداعي كامل واحترافي، تمامًا كما يفعل مدير إبداعي أول في استوديو تصميم راقٍ.

خطوات عملك:

1) التحليل الاستراتيجي: اقرأ الملاحظات جيدًا واستنتج (حتى لو لم تُذكر صراحة، استنتجها بذكاء من السياق):
- شخصية العلامة (Brand Personality)
- الجمهور المستهدف (Target Audience)
- الأهداف (Goals)
- المزاج العام (Mood)
- الكلمات المفتاحية (Keywords) — 6 إلى 10 كلمات
- الأسلوب (Style)
- الألوان (Colors) — انطباع عام قبل تفصيلها في كل مفهوم
- الطباعة (Typography) — انطباع عام
- الاتجاه البصري (Visual Direction) — انطباع عام

2) ابتكر 5 مفاهيم تصميم مختلفة تمامًا عن بعضها (ليست تنويعات على نفس الفكرة، بل 5 زوايا إبداعية حقيقية ومتباينة — مثلاً: كلاسيكي فاخر، عصري جريء، بسيط ونظيف، تراثي معاصر، تجريبي فني... اختر ما يناسب الملاحظات). كل مفهوم يجب أن يتضمن بالضبط:
- name: اسم جذاب وقصير للمفهوم
- story: القصة الإبداعية خلف المفهوم (لماذا يناسب هذا العميل تحديدًا)
- visual_direction: الاتجاه البصري التفصيلي
- layout_idea: فكرة التخطيط والتكوين (للشعار، البطاقات، الموقع، أو أي مخرجات مناسبة)
- color_palette: مصفوفة من 4 إلى 6 ألوان، كل لون بصيغة {"name": اسم اللون, "hex": "#RRGGBB"}
- typography: توصية طباعة محددة (أنواع خطوط أو أسلوب خط فعلي، مع تبرير)
- references: مراجع إلهام (أسماء علامات، حركات فنية، حقب زمنية، أو أساليب تصوير — بدون اختلاق روابط)
- moodboard_description: وصف تفصيلي لما يجب أن تحتويه لوحة المزاج (moodboard) لهذا المفهوم
- ai_image_prompt: برومبت جاهز بالإنجليزية لتوليد صورة بأداة ذكاء اصطناعي (Midjourney/DALL-E) يعكس هذا المفهوم بدقة — اكتبه دائمًا بالإنجليزية بغض النظر عن لغة باقي الإجابة لأنه برومبت تقني
- illustrator_notes: ملاحظات إنتاج عملية للمصمم المنفذ (illustrator/designer) — تفاصيل تقنية مثل: نسب الأبعاد، المسافات، كيفية التعامل مع الشعار، القيود، نصائح تنفيذ

3) بعد المفاهيم الخمسة، اكتب "creative_brief": بريف إبداعي واحد شامل جاهز للإنتاج، يلخص التوجيه العام ويوجّه أي فريق تنفيذي (تصميم، طباعة، رقمي) للانطلاق في العمل مباشرة. يجب أن يتضمن ملخص المشروع، الجمهور، النبرة، التوصية بأي من المفاهيم الخمسة أنسب ولماذا (مع ذكر أن بقية المفاهيم بدائل قوية أيضًا)، والخطوات التالية المقترحة.

${langDirective}

قواعد صارمة للمخرجات:
- أجب بكائن JSON صالح فقط (valid JSON)، بدون أي نص قبله أو بعده، وبدون أسوار كود Markdown (لا تستخدم \`\`\`).
- يجب أن يطابق المخرج هذا الشكل بالضبط (المفاتيح بالإنجليزية كما هي، القيم بلغة الإجابة المطلوبة أعلاه):

{
  "analysis": {
    "brand_personality": "string",
    "target_audience": "string",
    "goals": "string",
    "mood": "string",
    "keywords": ["string", "..."],
    "style": "string",
    "colors": "string",
    "typography": "string",
    "visual_direction": "string"
  },
  "concepts": [
    {
      "name": "string",
      "story": "string",
      "visual_direction": "string",
      "layout_idea": "string",
      "color_palette": [{"name": "string", "hex": "#RRGGBB"}],
      "typography": "string",
      "references": "string",
      "moodboard_description": "string",
      "ai_image_prompt": "string (always in English)",
      "illustrator_notes": "string"
    }
  ],
  "creative_brief": "string (multi-paragraph, plain text, use line breaks between sections, no markdown headers)"
}

- يجب أن تحتوي مصفوفة "concepts" على 5 عناصر بالضبط، مختلفة عن بعضها بوضوح في الاتجاه والألوان والطباعة والقصة.
- لا تكتب أي شيء خارج كائن JSON.`;
}

function buildUserMessage(clientName, notes, lang) {
  const label = lang === "ar" ? "اسم العميل/المشروع" : "Client/Project name";
  const notesLabel = lang === "ar" ? "ملاحظات الاجتماع الخام" : "Raw meeting notes";
  const prefix = clientName ? `${label}: ${clientName}\n\n` : "";
  return `${prefix}${notesLabel}:\n${notes}`;
}

// ---------- API calls ----------

async function callAnthropic(apiKey, model, systemPrompt, userMessage) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }]
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${res.status} ${res.statusText} — ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.content.map((b) => b.text || "").join("");
}

async function callOpenAI(apiKey, model, systemPrompt, userMessage) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.9
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${res.status} ${res.statusText} — ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

function extractJson(rawText) {
  let text = rawText.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no-json");
  return JSON.parse(text.slice(start, end + 1));
}

// ---------- Rendering ----------

function el(tag, opts = {}, children = []) {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.title) node.title = opts.title;
  children.forEach((c) => c && node.appendChild(c));
  return node;
}

function renderAnalysis(analysis, lang) {
  const labels = I18N[lang].analysis_labels;
  const grid = document.getElementById("analysis-grid");
  grid.innerHTML = "";
  const order = ["brand_personality", "target_audience", "goals", "mood", "keywords", "style", "colors", "typography", "visual_direction"];
  order.forEach((key) => {
    if (!(key in analysis)) return;
    let valueText = analysis[key];
    if (Array.isArray(valueText)) valueText = valueText.join(" · ");
    const item = el("div", { className: "analysis-item" }, [
      el("div", { className: "label", text: labels[key] || key }),
      el("div", { className: "value", text: valueText })
    ]);
    grid.appendChild(item);
  });
}

function renderConcepts(concepts, lang) {
  const labels = I18N[lang].concept_labels;
  const wrap = document.getElementById("concepts-list");
  wrap.innerHTML = "";
  concepts.forEach((concept, idx) => {
    const sections = [];
    ["story", "visual_direction", "layout_idea"].forEach((key) => {
      if (concept[key]) {
        sections.push(el("div", { className: "concept-section" }, [
          el("div", { className: "label", text: labels[key] }),
          el("div", { className: "value", text: concept[key] })
        ]));
      }
    });

    let paletteBlock = null;
    if (Array.isArray(concept.color_palette) && concept.color_palette.length) {
      const row = el("div", { className: "palette-row" });
      concept.color_palette.forEach((c) => {
        const dot = el("span", { className: "dot" });
        dot.style.background = c.hex || "#888";
        const swatch = el("span", { className: "swatch", title: lang === "ar" ? "انقر للنسخ" : "Click to copy" }, [
          dot,
          el("span", { text: `${c.name || ""} ${c.hex || ""}`.trim() })
        ]);
        swatch.addEventListener("click", () => copyText(c.hex || "", swatch));
        row.appendChild(swatch);
      });
      paletteBlock = el("div", { className: "concept-section" }, [
        el("div", { className: "label", text: labels.color_palette }),
        row
      ]);
    }

    ["typography", "references", "moodboard_description"].forEach((key) => {
      if (concept[key]) {
        sections.push(el("div", { className: "concept-section" }, [
          el("div", { className: "label", text: labels[key] }),
          el("div", { className: "value", text: concept[key] })
        ]));
      }
    });

    let promptBlock = null;
    if (concept.ai_image_prompt) {
      const box = el("div", { className: "ai-prompt-box", text: concept.ai_image_prompt });
      promptBlock = el("div", { className: "concept-section" }, [
        el("div", { className: "label", text: labels.ai_image_prompt }),
        box
      ]);
    }

    let notesBlock = null;
    if (concept.illustrator_notes) {
      notesBlock = el("div", { className: "concept-section" }, [
        el("div", { className: "label", text: labels.illustrator_notes }),
        el("div", { className: "value", text: concept.illustrator_notes })
      ]);
    }

    const card = el("div", { className: "concept-card" }, [
      el("div", { className: "concept-index", text: `${I18N[lang].concept_word} ${idx + 1}` }),
      el("div", { className: "concept-name", text: concept.name || "" }),
      ...sections.slice(0, 1),
      paletteBlock,
      ...sections.slice(1),
      promptBlock,
      notesBlock
    ]);
    wrap.appendChild(card);
  });
}

function renderBrief(briefText) {
  const box = document.getElementById("brief-content");
  box.textContent = briefText;
}

function copyText(text, feedbackEl) {
  navigator.clipboard.writeText(text).then(() => {
    if (feedbackEl) {
      const original = feedbackEl.getAttribute("title");
      feedbackEl.setAttribute("title", I18N[currentLang].copied);
      setTimeout(() => feedbackEl.setAttribute("title", original), 1200);
    }
  });
}

// ---------- Loading state ----------

function startLoading(lang) {
  const card = document.getElementById("loading-card");
  const text = document.getElementById("loading-text");
  const messages = I18N[lang].loading;
  let i = 0;
  card.classList.remove("hidden");
  text.textContent = messages[0];
  loadingTimer = setInterval(() => {
    i = (i + 1) % messages.length;
    text.textContent = messages[i];
  }, 2600);
}

function stopLoading() {
  clearInterval(loadingTimer);
  document.getElementById("loading-card").classList.add("hidden");
}

function showError(msg) {
  const box = document.getElementById("error-box");
  box.textContent = msg;
  box.classList.remove("hidden");
}
function clearError() {
  const box = document.getElementById("error-box");
  box.classList.add("hidden");
  box.textContent = "";
}

// ---------- Main flow ----------

async function generate() {
  clearError();
  const provider = document.getElementById("provider").value;
  const model = document.getElementById("model").value.trim();
  const apiKey = document.getElementById("api-key").value.trim();
  const clientName = document.getElementById("client-name").value.trim();
  const notes = document.getElementById("notes").value.trim();
  const t = I18N[currentLang];

  if (!apiKey) { showError(t.err_no_key); return; }
  if (!notes) { showError(t.err_no_notes); return; }

  persistSettingsIfRequested();

  const btn = document.getElementById("generate-btn");
  btn.disabled = true;
  document.getElementById("results").classList.add("hidden");
  startLoading(currentLang);

  try {
    const systemPrompt = buildSystemPrompt(currentLang);
    const userMessage = buildUserMessage(clientName, notes, currentLang);
    const raw = provider === "anthropic"
      ? await callAnthropic(apiKey, model, systemPrompt, userMessage)
      : await callOpenAI(apiKey, model, systemPrompt, userMessage);

    let data;
    try {
      data = extractJson(raw);
    } catch (_) {
      stopLoading();
      showError(`${t.err_parse}\n\n${raw}`);
      btn.disabled = false;
      return;
    }

    renderAnalysis(data.analysis || {}, currentLang);
    renderConcepts(data.concepts || [], currentLang);
    renderBrief(data.creative_brief || "");
    document.getElementById("results").classList.remove("hidden");
    stopLoading();
  } catch (err) {
    stopLoading();
    showError(t.err_generic + err.message);
  } finally {
    btn.disabled = false;
  }
}

// ---------- Wiring ----------

document.addEventListener("DOMContentLoaded", () => {
  applyLanguage(currentLang);
  loadSettings();

  document.getElementById("lang-toggle").addEventListener("click", () => {
    applyLanguage(currentLang === "ar" ? "en" : "ar");
  });

  document.getElementById("settings-toggle").addEventListener("click", () => {
    document.getElementById("settings-panel").classList.toggle("hidden");
  });
  document.getElementById("settings-close").addEventListener("click", () => {
    document.getElementById("settings-panel").classList.add("hidden");
  });

  document.getElementById("generate-btn").addEventListener("click", generate);

  document.getElementById("copy-brief").addEventListener("click", () => {
    const text = document.getElementById("brief-content").textContent;
    copyText(text, null);
  });
  document.getElementById("download-brief").addEventListener("click", () => {
    const text = document.getElementById("brief-content").textContent;
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "creative-brief.md";
    a.click();
    URL.revokeObjectURL(a.href);
  });
});
