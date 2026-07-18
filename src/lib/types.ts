export type Lang = 'ar' | 'en'

export type LocalizedText = Record<Lang, string>

export type QuestionType = 'text' | 'textarea' | 'select' | 'chips'

export interface QuestionOption {
  value: string
  label: LocalizedText
}

export interface Question {
  id: string
  label: LocalizedText
  placeholder?: LocalizedText
  help?: LocalizedText
  type: QuestionType
  required: boolean
  options?: QuestionOption[]
}

export type ProjectTypeId =
  | 'design'
  | 'game'
  | 'video'
  | 'programming'
  | 'marketing'
  | 'image'
  | 'website'
  | 'writing'
  | 'other'

export interface ProjectType {
  id: ProjectTypeId
  icon: string
  label: LocalizedText
  description: LocalizedText
  isVisual: boolean
  personaRole: LocalizedText
  questions: Question[]
}

export type ModelId =
  | 'claude'
  | 'chatgpt'
  | 'gemini'
  | 'flux'
  | 'midjourney'
  | 'stable-diffusion'

export interface ModelInfo {
  id: ModelId
  name: string
  category: 'text' | 'image'
  color: string
}

export type Answers = Record<string, string>

export interface Brief {
  projectType: ProjectTypeId
  answers: Answers
  extraNotes: string
  outputLang: Lang
  targetModels: ModelId[]
}

export interface Template {
  id: string
  projectType: ProjectTypeId
  title: LocalizedText
  subtitle: LocalizedText
  answers: Answers
  extraNotes?: string
}

export interface GeneratedPrompt {
  model: ModelId
  content: string
}

export interface PromptSession {
  id: string
  createdAt: number
  projectType: ProjectTypeId
  answers: Answers
  extraNotes: string
  outputLang: Lang
  targetModels: ModelId[]
  generated: GeneratedPrompt[]
  qualityScore: number
  favorite: boolean
  title: string
}
