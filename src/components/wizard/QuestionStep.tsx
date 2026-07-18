import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { ProjectType, Question } from '../../lib/types'
import { useI18n } from '../../i18n'
import { QuestionField } from '../QuestionField'
import { ProgressBar } from './ProgressBar'

interface Props {
  projectType: ProjectType
  question: Question
  index: number
  total: number
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export function QuestionStep({ projectType, question, index, total, value, onChange, onNext, onBack }: Props) {
  const { lang, dir, t } = useI18n()
  const Back = dir === 'rtl' ? ArrowRight : ArrowLeft
  const Forward = dir === 'rtl' ? ArrowLeft : ArrowRight
  const canProceed = !question.required || value.trim().length > 0

  return (
    <div className="mx-auto max-w-xl animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between text-xs text-(--text-muted)">
        <span>{projectType.label[lang]}</span>
        <span>{t.step_of(index + 1, total)}</span>
      </div>
      <ProgressBar current={index} total={total} />

      <div className="mt-10">
        <QuestionField question={question} value={value} onChange={onChange} autoFocus />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-(--text-muted) transition hover:bg-(--surface-2) hover:text-(--text)"
        >
          <Back size={16} />
          {t.back}
        </button>

        <div className="flex items-center gap-2">
          {!question.required && (
            <button
              type="button"
              onClick={onNext}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-(--text-muted) transition hover:bg-(--surface-2) hover:text-(--text)"
            >
              {t.skip}
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-(--accent) to-(--accent-2) px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.next}
            <Forward size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
