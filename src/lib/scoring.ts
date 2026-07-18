import type { Answers, Lang, ProjectType, Question } from './types'

export interface MissingInfoItem {
  question: Question
}

export interface ScoreResult {
  score: number
  missing: MissingInfoItem[]
  answeredRequired: number
  totalRequired: number
  answeredOptional: number
  totalOptional: number
}

function isFilled(value: string | undefined): boolean {
  return !!value && value.trim().length > 0
}

export function computeScore(projectType: ProjectType, answers: Answers, extraNotes: string): ScoreResult {
  const required = projectType.questions.filter((q) => q.required)
  const optional = projectType.questions.filter((q) => !q.required)

  const answeredRequired = required.filter((q) => isFilled(answers[q.id]))
  const answeredOptional = optional.filter((q) => isFilled(answers[q.id]))
  const missing: MissingInfoItem[] = required
    .filter((q) => !isFilled(answers[q.id]))
    .map((question) => ({ question }))

  const requiredScore = required.length ? (answeredRequired.length / required.length) * 65 : 65
  const optionalScore = optional.length ? (answeredOptional.length / optional.length) * 25 : 25

  const richTextFields = required.filter((q) => q.type === 'textarea')
  const avgLen =
    richTextFields.length > 0
      ? richTextFields.reduce((sum, q) => sum + (answers[q.id]?.trim().length ?? 0), 0) / richTextFields.length
      : extraNotes.trim().length

  let detailBonus = 0
  if (avgLen > 120) detailBonus = 10
  else if (avgLen > 50) detailBonus = 7
  else if (avgLen > 15) detailBonus = 3

  const extraBonus = isFilled(extraNotes) ? 0 : 0

  const score = Math.round(Math.min(100, requiredScore + optionalScore + detailBonus + extraBonus))

  return {
    score,
    missing,
    answeredRequired: answeredRequired.length,
    totalRequired: required.length,
    answeredOptional: answeredOptional.length,
    totalOptional: optional.length,
  }
}

export function scoreLabel(score: number, lang: Lang): string {
  if (score >= 85) return lang === 'ar' ? 'ممتاز' : 'Excellent'
  if (score >= 65) return lang === 'ar' ? 'جيد' : 'Good'
  if (score >= 40) return lang === 'ar' ? 'يحتاج تحسين' : 'Needs work'
  return lang === 'ar' ? 'ناقص' : 'Incomplete'
}

export function generateSuggestions(
  projectType: ProjectType,
  answers: Answers,
  extraNotes: string,
  lang: Lang,
): string[] {
  const suggestions: string[] = []
  const missing = projectType.questions.filter((q) => q.required && !isFilled(answers[q.id]))

  if (missing.length > 0) {
    suggestions.push(
      lang === 'ar'
        ? `أجب عن ${missing.length} سؤالًا أساسيًا لم تتم الإجابة عليه بعد للحصول على نتائج أدق.`
        : `Answer the ${missing.length} remaining required question(s) for much more accurate results.`,
    )
  }

  const textareas = projectType.questions.filter((q) => q.type === 'textarea')
  const shortAnswers = textareas.filter((q) => {
    const v = answers[q.id]
    return isFilled(v) && v.trim().length < 25
  })
  if (shortAnswers.length > 0) {
    suggestions.push(
      lang === 'ar'
        ? 'وسّع إجاباتك النصية قليلاً — التفاصيل الإضافية (أمثلة، مراجع، سياق) تحسّن جودة النتيجة بشكل كبير.'
        : 'Expand your longer answers a bit — extra detail (examples, references, context) meaningfully improves the output.',
    )
  }

  if (projectType.isVisual) {
    const hasStyle = ['style', 'artStyle', 'styleVibe'].some((k) => isFilled(answers[k]))
    if (!hasStyle) {
      suggestions.push(
        lang === 'ar'
          ? 'حدّد الأسلوب البصري المرغوب (مينيمال، واقعي، كرتوني...) لتوجيه نماذج الصور بدقة.'
          : 'Specify a visual style (minimal, realistic, cartoon...) to guide image models precisely.',
      )
    }
  }

  if (projectType.id === 'programming' && !isFilled(answers.constraints)) {
    suggestions.push(
      lang === 'ar'
        ? 'أضف قيودًا تقنية (الأداء، التوافق، المكتبات المسموحة) لتفادي حلول غير مناسبة.'
        : 'Add technical constraints (performance, compatibility, allowed libraries) to avoid unsuitable solutions.',
    )
  }

  if (projectType.id === 'image' && !isFilled(answers.negativeElements)) {
    suggestions.push(
      lang === 'ar'
        ? 'اذكر العناصر التي تريد استبعادها من الصورة لتحسين دقة التوليد.'
        : 'Mention elements to exclude from the image to improve generation accuracy.',
    )
  }

  if (!isFilled(extraNotes)) {
    suggestions.push(
      lang === 'ar'
        ? 'أضف ملاحظات إضافية أو أمثلة مرجعية في حقل الملاحظات لمزيد من التخصيص.'
        : 'Add extra notes or reference examples in the notes field for further personalization.',
    )
  }

  return suggestions.slice(0, 5)
}
