# 🎬 Thumbnail Director AI

**العربية أولاً، ثم الإنجليزية | Arabic first, English follows.**

---

## نظرة عامة | Overview

**بالعربية:**
"Thumbnail Director AI" هو سير عمل n8n احترافي ومعياري (modular) يحوّل سكربت فيديو يوتيوب إلى
تحليل إبداعي كامل + 10 أفكار احترافية لصورة مصغرة + أوامر (prompts) جاهزة للإنتاج لنماذج توليد
الصور بالذكاء الاصطناعي. كل حقول النص في المخرجات ثنائية اللغة `{ "ar": "...", "en": "..." }`
مع تفضيل العربية كلغة أساسية والإنجليزية كلغة ثانوية.

**English:**
"Thumbnail Director AI" is a professional, modular n8n workflow that turns a YouTube video
script into a full creative analysis, 10 professional thumbnail concepts, and production-ready
prompts for AI image-generation models. Every text field in the output is bilingual
`{ "ar": "...", "en": "..." }`, with Arabic as the primary language and English as the
secondary one.

---

## البنية المعمارية | Architecture

```
📝 Script Input (Form Trigger)
        │
🧹 Normalize → ✅ Validate Length ──(too short)──▶ ❌ Error
        │
        ▼
🎬 Module 1: Script Analysis        (sub-workflow, standalone)
        │  → Creative Director analysis (9 fields)
        ▼
💡 Module 2: Concept Generator      (sub-workflow, standalone)
        │  → exactly 10 thumbnail concepts
        ▼
🖼️ Module 3: Prompt Engineer        (sub-workflow, standalone, loops per concept)
        │  → production-ready image-generation prompt per concept
        ▼
📦 Build Final Report → JSON response
```

**لماذا هذا التصميم؟ | Why this design?**

- **معياري | Modular** — كل وحدة (Module) هي سير عمل مستقل يُستدعى عبر عقدة `Execute Workflow`،
  يمكن اختباره أو تشغيله بمفرده أو استبداله دون لمس بقية النظام.
  Each module is an independent sub-workflow called via `Execute Workflow`; it can be tested,
  run, or replaced on its own without touching the rest of the system.
- **قابل للتوسع | Scalable** — إضافة وحدة جديدة (مثل تحليل المنافسين أو توليد الصورة فعلياً)
  تعني فقط إنشاء سير عمل فرعي جديد وربطه بنفس النمط — دون إعادة هندسة الأنابيب الحالية.
  Adding a new module (e.g. competitor analysis, actual image generation) just means creating
  another sub-workflow and wiring it in the same pattern — no rework of the existing pipeline.
- **مستقل عن المزوّد | Provider-agnostic** — استدعاء الذكاء الاصطناعي يتم عبر عقدة `HTTP Request`
  عامة (وليست عقدة مقفلة على مزوّد واحد)، لذا يسهل استبدال OpenAI بأي نموذج آخر (Claude, Gemini...)
  بتعديل عقدة واحدة فقط في كل وحدة.
  The AI call goes through a generic `HTTP Request` node (not a provider-locked node), so
  swapping OpenAI for another model (Claude, Gemini, etc.) only requires editing one node per
  module.

---

## الملفات | Files

| الملف | الوصف |
|---|---|
| `1-main-orchestrator.json` | سير العمل الرئيسي — استلام السكربت وتنسيق الوحدات الثلاث. Main orchestrator — receives the script and coordinates the 3 modules. |
| `2-module-script-analysis.json` | الوحدة 1: التحليل الإبداعي للسكربت. Module 1: Creative script analysis. |
| `3-module-concept-generator.json` | الوحدة 2: توليد 10 أفكار للصورة المصغرة. Module 2: 10 thumbnail concepts generator. |
| `4-module-prompt-engineer.json` | الوحدة 3: توليد أوامر توليد الصور الجاهزة للإنتاج. Module 3: production-ready image-generation prompts. |

---

## خطوات التثبيت | Setup Steps

1. **استورد الملفات الأربعة** إلى n8n (كل ملف كسير عمل منفصل):
   `Import from File` لكل من `2-`, `3-`, `4-` أولاً، ثم `1-main-orchestrator.json` أخيراً.
   **Import all four files** into n8n as separate workflows: import `2-`, `3-`, `4-` first,
   then `1-main-orchestrator.json` last.

2. **أعد ربط عقد Execute Workflow** — افتح `1-main-orchestrator.json` بعد الاستيراد، وفي كل عقدة
   من العقد الثلاث (🎬 Module 1، 💡 Module 2، 🖼️ Module 3) اختر سير العمل الفرعي الصحيح من القائمة
   المنسدلة (المعرّفات الأصلية لا تُنقل تلقائياً بين نُسخ n8n المختلفة).
   **Re-link the Execute Workflow nodes** — after import, open the main orchestrator and, in
   each of the three Execute Workflow nodes, (re)select the matching sub-workflow from the
   dropdown (workflow IDs don't transfer automatically between n8n instances).

3. **أضف بيانات اعتماد OpenAI** — أنشئ Credential من نوع "OpenAi account" في n8n (Settings →
   Credentials)، ثم اربطه بعقدة `🤖 Call AI Model` (HTTP Request) في كل وحدة من الوحدات الثلاث.
   **Add OpenAI credentials** — create an "OpenAi account" credential in n8n (Settings →
   Credentials), then attach it to the `🤖 Call AI Model` (HTTP Request) node in each of the
   three modules.

4. **فعّل سير العمل الرئيسي** واحصل على رابط النموذج العام (Form URL) من عقدة `📝 Script Input`،
   أو شغّله يدوياً من محرر n8n لأغراض الاختبار.
   **Activate the main workflow** and grab the public form URL from the `📝 Script Input` node,
   or run it manually from the n8n editor for testing.

---

## تبديل نموذج الذكاء الاصطناعي | Swapping the AI Model

كل وحدة تحتوي على عقدتين قابلتين للتعديل بسهولة:

- `🧩 Build AI Request` — تُحدَّد فيها `model` و `temperature` (يمكن رفعها إلى `gpt-4o` مثلاً).
- `🤖 Call AI Model` — عقدة HTTP Request تستدعي `https://api.openai.com/v1/chat/completions`.
  لاستخدام Anthropic Claude أو أي مزوّد آخر، غيّر الـ URL وشكل الـ body وبيانات الاعتماد في هذه
  العقدة فقط — بقية سير العمل لن يتأثر.

Each module has two nodes designed for easy swapping:

- `🧩 Build AI Request` — sets `model` and `temperature` (e.g. bump to `gpt-4o`).
- `🤖 Call AI Model` — an HTTP Request node calling `https://api.openai.com/v1/chat/completions`.
  To use Anthropic Claude or another provider, just change this node's URL, body shape, and
  credentials — nothing else in the workflow needs to change.

---

## شكل المخرجات النهائية | Final Output Shape

```json
{
  "workflow": "Thumbnail Director AI",
  "generated_at": "2026-07-18T12:00:00.000Z",
  "source_script": "...",
  "creative_director_analysis": {
    "emotional_hook": { "ar": "...", "en": "..." },
    "curiosity_trigger": { "ar": "...", "en": "..." },
    "strongest_moment": { "ar": "...", "en": "..." },
    "main_subject": { "ar": "...", "en": "..." },
    "facial_expression": { "ar": "...", "en": "..." },
    "composition": { "ar": "...", "en": "..." },
    "lighting": { "ar": "...", "en": "..." },
    "color_psychology": { "ar": "...", "en": "..." },
    "ctr_optimization": { "ar": "...", "en": "..." }
  },
  "thumbnail_concepts": {
    "concepts_with_prompts": [
      {
        "id": 1,
        "title": { "ar": "...", "en": "..." },
        "explanation": { "ar": "...", "en": "..." },
        "camera_angle": { "ar": "...", "en": "..." },
        "composition": { "ar": "...", "en": "..." },
        "background": { "ar": "...", "en": "..." },
        "character_pose": { "ar": "...", "en": "..." },
        "emotion": { "ar": "...", "en": "..." },
        "lighting": { "ar": "...", "en": "..." },
        "color_palette": { "ar": "...", "en": "..." },
        "text_placement": { "ar": "...", "en": "..." },
        "image_prompt_en": "...",
        "prompt_explanation_ar": "...",
        "negative_prompt": "...",
        "aspect_ratio": "16:9",
        "recommended_models": ["Midjourney v6", "DALL·E 3", "Stable Diffusion XL / Flux"],
        "style_tags": ["...", "...", "..."]
      }
      // ... 10 عناصر بالضبط | exactly 10 items
    ]
  }
}
```

---

## التوسع لاحقاً | Expanding Later

بفضل التصميم المعياري، يمكن إضافة وحدات جديدة بسهولة كسير عمل فرعي جديد يُستدعى بنفس نمط
`Execute Workflow`، على سبيل المثال:

- **وحدة 4:** تقييم/تسجيل A-B للأفكار العشرة وترتيبها حسب التوقع بأعلى نسبة نقر.
- **وحدة 5:** تحليل اتجاهات المنافسين (جلب صور مصغرة مشابهة وتحليلها).
- **وحدة 6:** استدعاء API فعلي لتوليد الصورة (Midjourney/DALL·E/Stable Diffusion) من `image_prompt_en`.
- **وحدة 7:** رفع الصورة والعنوان تلقائياً إلى يوتيوب عبر YouTube Data API.

Thanks to the modular design, new capabilities can be added as additional sub-workflows wired
in with the same `Execute Workflow` pattern, for example:

- **Module 4:** A/B scoring of the 10 concepts, ranked by predicted CTR.
- **Module 5:** Competitor/trend analysis (fetch and analyze similar thumbnails).
- **Module 6:** Actually calling an image-generation API (Midjourney/DALL·E/Stable Diffusion)
  using `image_prompt_en`.
- **Module 7:** Auto-uploading the thumbnail and title to YouTube via the YouTube Data API.
