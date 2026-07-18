import { Wand2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { Answers, Lang, ModelId, ProjectType } from '../../lib/types'
import { MODELS } from '../../lib/models'
import { computeScore, generateSuggestions } from '../../lib/scoring'
import { getIcon } from '../../lib/icons'
import { QuestionField } from '../QuestionField'
import { QualityMeter } from '../insights/QualityMeter'
import { MissingInfo } from '../insights/MissingInfo'
import { Suggestions } from '../insights/Suggestions'

interface Props {
  projectType: ProjectType
  answers: Answers
  onAnswerChange: (id: string, value: string) => void
  extraNotes: string
  onExtraNotesChange: (value: string) => void
  outputLang: Lang
  onOutputLangChange: (lang: Lang) => void
  targetModels: ModelId[]
  onToggleModel: (id: ModelId) => void
  onChangeType: () => void
  onGenerate: () => void
}

export function ReviewStep({
  projectType,
  answers,
  onAnswerChange,
  extraNotes,
  onExtraNotesChange,
  outputLang,
  onOutputLangChange,
  targetModels,
  onToggleModel,
  onChangeType,
  onGenerate,
}: Props) {
  const { lang, t } = useI18n()
  const Icon = getIcon(projectType.icon)
  const result = computeScore(projectType, answers, extraNotes)
  const suggestions = generateSuggestions(projectType, answers, extraNotes, lang)

  const jumpTo = (id: string) => {
    document.getElementById(`field-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const textModels = MODELS.filter((m) => m.category === 'text')
  const imageModels = MODELS.filter((m) => m.category === 'image')

  return (
    <div className="mx-auto grid max-w-5xl animate-fade-in-up gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-(--accent) to-(--accent-2) text-white">
              <Icon size={18} />
            </span>
            <div>
              <div className="font-semibold">{projectType.label[lang]}</div>
              <div className="text-xs text-(--text-muted)">{t.fields_answered(result.answeredRequired + result.answeredOptional, result.totalRequired + result.totalOptional)}</div>
            </div>
          </div>
          <button type="button" onClick={onChangeType} className="text-xs font-medium text-(--accent) hover:underline">
            {t.start_over}
          </button>
        </div>

        <div className="space-y-5 rounded-2xl border border-(--border) bg-(--surface) p-5">
          {projectType.questions.map((q) => (
            <div key={q.id} id={`field-${q.id}`} className="scroll-mt-24">
              <QuestionField question={q} value={answers[q.id] ?? ''} onChange={(v) => onAnswerChange(q.id, v)} compact />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
          <label className="text-sm font-medium">{t.extra_notes_title}</label>
          <textarea
            value={extraNotes}
            onChange={(e) => onExtraNotesChange(e.target.value)}
            placeholder={t.extra_notes_placeholder}
            rows={3}
            className="mt-2 w-full rounded-xl border bg-(--surface) px-3.5 py-2.5 text-sm outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20"
          />
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
          <label className="text-sm font-medium">{t.output_lang_title}</label>
          <div className="mt-2.5 flex gap-2">
            {(['ar', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onOutputLangChange(l)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  outputLang === l
                    ? 'border-(--accent) bg-(--accent)/10 text-(--text)'
                    : 'border-(--border) text-(--text-muted) hover:text-(--text)'
                }`}
              >
                {l === 'ar' ? t.output_lang_ar : t.output_lang_en}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
          <label className="text-sm font-medium">{t.select_models_title}</label>
          <p className="mt-1 text-xs text-(--text-muted)">{t.select_models_subtitle}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {textModels.map((m) => (
              <ModelChip key={m.id} label={m.name} color={m.color} active={targetModels.includes(m.id)} onClick={() => onToggleModel(m.id)} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {imageModels.map((m) => (
              <ModelChip key={m.id} label={m.name} color={m.color} active={targetModels.includes(m.id)} onClick={() => onToggleModel(m.id)} />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={targetModels.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-(--accent) to-(--accent-2) px-6 py-4 text-base font-semibold text-white shadow-lg shadow-(--accent)/20 transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Wand2 size={18} />
          {t.generate}
        </button>
      </div>

      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <QualityMeter score={result.score} />
        <MissingInfo items={result.missing} onJump={jumpTo} />
        <Suggestions suggestions={suggestions} />
      </div>
    </div>
  )
}

function ModelChip({ label, color, active, onClick }: { label: string; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={active ? { borderColor: color, backgroundColor: `${color}1a`, color } : undefined}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active ? '' : 'border-(--border) text-(--text-muted) hover:text-(--text)'
      }`}
    >
      {label}
    </button>
  )
}
