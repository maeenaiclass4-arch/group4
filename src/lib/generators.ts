import { getProjectType } from './projectTypes'
import type { Answers, GeneratedPrompt, Lang, ModelId, ProjectType, ProjectTypeId, Question } from './types'

interface QA {
  label: string
  value: string
}

const isFilled = (v: string | undefined) => !!v && v.trim().length > 0

function optionLabel(question: Question, value: string, lang: Lang): string {
  const opt = question.options?.find((o) => o.value === value)
  return opt ? opt.label[lang] : value
}

function collectQA(projectType: ProjectType, answers: Answers, lang: Lang): QA[] {
  return projectType.questions
    .filter((q) => isFilled(answers[q.id]))
    .map((q) => ({ label: q.label[lang], value: optionLabel(q, answers[q.id], lang) }))
}

const PRIMARY_FIELD: Record<ProjectTypeId, string> = {
  design: 'brandInfo',
  game: 'mechanics',
  video: 'concept',
  programming: 'context',
  marketing: 'product',
  image: 'subject',
  website: 'purpose',
  writing: 'topic',
  other: 'topic',
}

const STYLE_FIELD: Record<ProjectTypeId, string | undefined> = {
  design: 'style',
  game: 'artStyle',
  video: 'toneStyle',
  programming: undefined,
  marketing: 'tone',
  image: 'style',
  website: 'styleVibe',
  writing: 'tone',
  other: 'style',
}

const DEFAULT_ASPECT: Record<ProjectTypeId, string> = {
  design: '1:1',
  game: '16:9',
  video: '16:9',
  programming: '1:1',
  marketing: '4:5',
  image: '1:1',
  website: '16:9',
  writing: '1:1',
  other: '1:1',
}

const STR = {
  ar: {
    role: 'الدور',
    context: 'السياق',
    task: 'المهمة',
    format: 'صيغة الإخراج',
    notes: 'ملاحظات إضافية',
    you_are: (r: string) => `أنت ${r}.`,
    claude_task_intro: 'بناءً على المعلومات أعلاه، نفّذ المطلوب بعناية واحترافية عالية:',
    claude_format_1: 'استخدم لغة واضحة ومنظمة، وقسّم الإجابة إلى أقسام منطقية عند الحاجة.',
    claude_format_2: 'إن كانت هناك معلومة أساسية ناقصة تمنعك من التنفيذ بدقة، اسأل عنها أولًا قبل المتابعة.',
    claude_format_3: 'قدّم أفضل نسخة ممكنة مباشرة، دون مقدمات طويلة غير ضرورية.',
    chatgpt_act_as: (r: string) => `تصرّف كـ ${r}.`,
    chatgpt_goal: 'الهدف',
    chatgpt_info: 'المعلومات المتاحة',
    chatgpt_required: 'المطلوب منك',
    chatgpt_r1: 'نفّذ المهمة كاملة خطوة بخطوة.',
    chatgpt_r2: 'قدّم النتيجة بصيغة منظمة وجاهزة للاستخدام مباشرة.',
    chatgpt_r3: 'إن كانت هناك تفاصيل مهمة ناقصة، اسأل عنها أولًا باختصار قبل التنفيذ.',
    gemini_role: 'دورك',
    gemini_context: 'السياق',
    gemini_goal: 'المطلوب',
    gemini_instructions: 'تعليمات',
    gemini_i1: 'فكّر خطوة بخطوة داخليًا قبل تقديم الإجابة النهائية.',
    gemini_i2: 'قدّم أكثر من بديل أو خيار إن كان ذلك مفيدًا.',
    gemini_i3: 'اجعل الإجابة موجزة، منظمة، ومباشرة.',
    generic_goal: 'ساعدني في تحقيق الهدف التالي بأفضل شكل ممكن.',
  },
  en: {
    role: 'Role',
    context: 'Context',
    task: 'Task',
    format: 'Output format',
    notes: 'Additional notes',
    you_are: (r: string) => `You are ${r}.`,
    claude_task_intro: 'Based on the context above, complete the following with great care and professionalism:',
    claude_format_1: 'Use clear, well-organized language, and break the answer into logical sections where helpful.',
    claude_format_2: 'If a key piece of information is missing that prevents an accurate result, ask for it before proceeding.',
    claude_format_3: 'Deliver the best possible version directly, without unnecessary long preambles.',
    chatgpt_act_as: (r: string) => `Act as ${r}.`,
    chatgpt_goal: 'Goal',
    chatgpt_info: 'Available information',
    chatgpt_required: 'What I need from you',
    chatgpt_r1: 'Complete the whole task step by step.',
    chatgpt_r2: 'Deliver the result in a well-organized, ready-to-use format.',
    chatgpt_r3: 'If any important detail is missing, briefly ask for it before proceeding.',
    gemini_role: 'Your role',
    gemini_context: 'Context',
    gemini_goal: 'Goal',
    gemini_instructions: 'Instructions',
    gemini_i1: 'Reason step by step internally before giving the final answer.',
    gemini_i2: 'Offer more than one alternative or option when useful.',
    gemini_i3: 'Keep the answer concise, well-structured, and direct.',
    generic_goal: 'Help me achieve the following goal in the best possible way.',
  },
} as const

function buildContextLines(qa: QA[], extraNotes: string, lang: Lang): string[] {
  const lines = qa.map((item) => `- ${item.label}: ${item.value}`)
  if (isFilled(extraNotes)) lines.push(`- ${STR[lang].notes}: ${extraNotes.trim()}`)
  return lines
}

function primaryGoal(projectType: ProjectType, answers: Answers, lang: Lang): string {
  const field = PRIMARY_FIELD[projectType.id]
  const val = answers[field]
  return isFilled(val) ? val.trim() : STR[lang].generic_goal
}

export function buildSessionTitle(projectTypeId: ProjectTypeId, answers: Answers, lang: Lang): string {
  const projectType = getProjectType(projectTypeId)
  if (!projectType) return ''
  const goal = primaryGoal(projectType, answers, lang)
  if (goal === STR[lang].generic_goal) return projectType.label[lang]
  return goal.length > 60 ? `${goal.slice(0, 60).trim()}…` : goal
}

function buildClaudePrompt(projectType: ProjectType, answers: Answers, extraNotes: string, lang: Lang): string {
  const qa = collectQA(projectType, answers, lang)
  const s = STR[lang]
  const parts = [
    `<${s.role}>`,
    s.you_are(projectType.personaRole[lang]),
    `</${s.role}>`,
    '',
    `<${s.context}>`,
    ...buildContextLines(qa, extraNotes, lang),
    `</${s.context}>`,
    '',
    `<${s.task}>`,
    s.claude_task_intro,
    primaryGoal(projectType, answers, lang),
    `</${s.task}>`,
    '',
    `<${s.format}>`,
    `- ${s.claude_format_1}`,
    `- ${s.claude_format_2}`,
    `- ${s.claude_format_3}`,
    `</${s.format}>`,
  ]
  return parts.join('\n')
}

function buildChatGptPrompt(projectType: ProjectType, answers: Answers, extraNotes: string, lang: Lang): string {
  const qa = collectQA(projectType, answers, lang)
  const s = STR[lang]
  const parts = [
    s.chatgpt_act_as(projectType.personaRole[lang]),
    '',
    `${s.chatgpt_goal}: ${primaryGoal(projectType, answers, lang)}`,
    '',
    `${s.chatgpt_info}:`,
    ...buildContextLines(qa, extraNotes, lang),
    '',
    `${s.chatgpt_required}:`,
    `1. ${s.chatgpt_r1}`,
    `2. ${s.chatgpt_r2}`,
    `3. ${s.chatgpt_r3}`,
  ]
  return parts.join('\n')
}

function buildGeminiPrompt(projectType: ProjectType, answers: Answers, extraNotes: string, lang: Lang): string {
  const qa = collectQA(projectType, answers, lang)
  const s = STR[lang]
  const parts = [
    `${s.gemini_role}: ${projectType.personaRole[lang]}`,
    '',
    `${s.gemini_context}:`,
    ...buildContextLines(qa, extraNotes, lang),
    '',
    `${s.gemini_goal}: ${primaryGoal(projectType, answers, lang)}`,
    '',
    `${s.gemini_instructions}:`,
    `- ${s.gemini_i1}`,
    `- ${s.gemini_i2}`,
    `- ${s.gemini_i3}`,
  ]
  return parts.join('\n')
}

interface VisualBrief {
  subject: string
  style: string
  composition: string
  lighting: string
  colorPalette: string
  mood: string
  aspectRatio: string
  negative: string
}

function buildVisualBrief(projectType: ProjectType, answers: Answers, lang: Lang): VisualBrief {
  const id = projectType.id
  const styleField = STYLE_FIELD[id]
  const styleQuestion = projectType.questions.find((q) => q.id === styleField)
  const style = styleField && isFilled(answers[styleField]) && styleQuestion
    ? optionLabel(styleQuestion, answers[styleField], lang)
    : ''

  let subject = ''
  if (id === 'image') subject = answers.subject ?? ''
  else if (id === 'design') {
    const kindQ = projectType.questions.find((q) => q.id === 'designKind')
    const kind = kindQ && answers.designKind ? optionLabel(kindQ, answers.designKind, lang) : ''
    subject = [kind, answers.brandInfo].filter(isFilled).join(' — ')
  } else if (id === 'game') {
    const genreQ = projectType.questions.find((q) => q.id === 'gameGenre')
    const genre = genreQ && answers.gameGenre ? optionLabel(genreQ, answers.gameGenre, lang) : ''
    subject = [
      lang === 'ar' ? `آرت مفهومي للعبة ${genre}` : `concept art for a ${genre} game`,
      answers.mechanics,
    ]
      .filter(isFilled)
      .join(' — ')
  } else if (id === 'video') {
    subject = [lang === 'ar' ? 'لقطة رئيسية تمثل:' : 'key frame representing:', answers.concept]
      .filter(isFilled)
      .join(' ')
  } else if (id === 'marketing') {
    subject = [lang === 'ar' ? 'مشهد إعلاني لـ' : 'advertising visual for', answers.product]
      .filter(isFilled)
      .join(' ')
  } else if (id === 'website') {
    const siteQ = projectType.questions.find((q) => q.id === 'siteType')
    const siteKind = siteQ && answers.siteType ? optionLabel(siteQ, answers.siteType, lang) : ''
    subject = [lang === 'ar' ? `صورة بطولية لموقع ${siteKind}` : `hero image for a ${siteKind} website`, answers.purpose]
      .filter(isFilled)
      .join(' — ')
  } else {
    subject = primaryGoal(projectType, answers, lang)
  }

  if (!isFilled(subject)) subject = primaryGoal(projectType, answers, lang)

  return {
    subject: subject.trim(),
    style,
    composition: answers.composition ?? '',
    lighting: answers.lighting
      ? optionLabel(projectType.questions.find((q) => q.id === 'lighting') as Question, answers.lighting, lang)
      : '',
    colorPalette: answers.colorPalette ?? answers.colors ?? '',
    mood: answers.mood ?? '',
    aspectRatio: answers.aspectRatio ?? DEFAULT_ASPECT[id],
    negative: answers.negativeElements ?? '',
  }
}

function buildMidjourneyPrompt(projectType: ProjectType, answers: Answers, lang: Lang): string {
  const v = buildVisualBrief(projectType, answers, lang)
  const segments = [v.subject, v.style, v.composition, v.lighting, v.colorPalette, v.mood, 'highly detailed', 'professional quality']
    .filter(isFilled)
    .map((s) => s.trim())
  let prompt = segments.join(', ')
  prompt += ` --ar ${v.aspectRatio} --v 6.1 --style raw --stylize 250`
  if (isFilled(v.negative)) prompt += ` --no ${v.negative.trim()}`
  return prompt
}

function buildStableDiffusionPrompt(projectType: ProjectType, answers: Answers, lang: Lang): string {
  const v = buildVisualBrief(projectType, answers, lang)
  const positiveSegments = [
    isFilled(v.subject) ? `(${v.subject.trim()}:1.3)` : '',
    v.style,
    v.composition,
    v.lighting,
    v.colorPalette,
    v.mood,
    'highly detailed',
    'sharp focus',
    '8k',
  ].filter(isFilled)
  const positive = positiveSegments.join(', ')

  const negativeDefaults = lang === 'ar'
    ? 'جودة منخفضة, ضبابي, تشوهات, أطراف زائدة, علامة مائية, نص'
    : 'low quality, blurry, distorted, extra limbs, watermark, text'
  const negative = isFilled(v.negative) ? `${negativeDefaults}, ${v.negative.trim()}` : negativeDefaults

  const labels = lang === 'ar'
    ? { pos: 'الوصف الإيجابي', neg: 'الوصف السلبي (Negative Prompt)', settings: 'إعدادات مقترحة' }
    : { pos: 'Positive prompt', neg: 'Negative prompt', settings: 'Suggested settings' }

  return [
    `${labels.pos}:`,
    positive,
    '',
    `${labels.neg}:`,
    negative,
    '',
    `${labels.settings}:`,
    lang === 'ar'
      ? `النموذج: SDXL | الخطوات: 30 | CFG Scale: 7 | Sampler: DPM++ 2M Karras | نسبة الأبعاد: ${v.aspectRatio}`
      : `Model: SDXL | Steps: 30 | CFG Scale: 7 | Sampler: DPM++ 2M Karras | Aspect ratio: ${v.aspectRatio}`,
  ].join('\n')
}

function buildFluxPrompt(projectType: ProjectType, answers: Answers, lang: Lang): string {
  const v = buildVisualBrief(projectType, answers, lang)
  if (lang === 'ar') {
    const bits = [
      v.style ? `صورة بأسلوب ${v.style} تُظهر ${v.subject}` : `صورة تُظهر ${v.subject}`,
      v.composition ? `بتكوين ${v.composition}` : '',
      v.lighting ? `بإضاءة ${v.lighting}` : '',
      v.colorPalette ? `بألوان تميل إلى ${v.colorPalette}` : '',
      v.mood ? `تبعث شعورًا بـ${v.mood}` : '',
    ].filter(isFilled)
    return `${bits.join('، ')}. نسبة الأبعاد ${v.aspectRatio}. تفاصيل دقيقة وجودة احترافية عالية.`
  }
  const bits = [
    v.style ? `A ${v.style} image of ${v.subject}` : `An image of ${v.subject}`,
    v.composition ? `composed as ${v.composition}` : '',
    v.lighting ? `lit with ${v.lighting} lighting` : '',
    v.colorPalette ? `featuring a ${v.colorPalette} color palette` : '',
    v.mood ? `evoking a ${v.mood} mood` : '',
  ].filter(isFilled)
  return `${bits.join(', ')}. Aspect ratio ${v.aspectRatio}. Highly detailed, professional quality.`
}

export function generatePrompt(
  model: ModelId,
  projectTypeId: ProjectTypeId,
  answers: Answers,
  extraNotes: string,
  lang: Lang,
): string {
  const projectType = getProjectType(projectTypeId)
  if (!projectType) return ''

  switch (model) {
    case 'claude':
      return buildClaudePrompt(projectType, answers, extraNotes, lang)
    case 'chatgpt':
      return buildChatGptPrompt(projectType, answers, extraNotes, lang)
    case 'gemini':
      return buildGeminiPrompt(projectType, answers, extraNotes, lang)
    case 'midjourney':
      return buildMidjourneyPrompt(projectType, answers, lang)
    case 'stable-diffusion':
      return buildStableDiffusionPrompt(projectType, answers, lang)
    case 'flux':
      return buildFluxPrompt(projectType, answers, lang)
    default:
      return ''
  }
}

export function generateAllPrompts(
  models: ModelId[],
  projectTypeId: ProjectTypeId,
  answers: Answers,
  extraNotes: string,
  lang: Lang,
): GeneratedPrompt[] {
  return models.map((model) => ({
    model,
    content: generatePrompt(model, projectTypeId, answers, extraNotes, lang),
  }))
}
