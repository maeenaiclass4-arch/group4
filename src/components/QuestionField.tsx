import type { Question } from '../lib/types'
import { useI18n } from '../i18n'

interface Props {
  question: Question
  value: string
  onChange: (value: string) => void
  compact?: boolean
  autoFocus?: boolean
}

export function QuestionField({ question, value, onChange, compact, autoFocus }: Props) {
  const { lang, t } = useI18n()
  const label = question.label[lang]
  const placeholder = question.placeholder?.[lang]

  const inputBase = compact
    ? 'w-full rounded-xl border bg-(--surface) px-3.5 py-2.5 text-sm outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20'
    : 'w-full rounded-2xl border bg-(--surface) px-5 py-4 text-base outline-none transition focus:border-(--accent) focus:ring-4 focus:ring-(--accent)/15'

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-3'}>
      <label className={compact ? 'flex items-center gap-1.5 text-sm font-medium text-(--text)' : 'flex items-center gap-2 text-lg font-semibold text-(--text)'}>
        {label}
        {question.required ? (
          <span className="text-xs font-normal text-(--accent-2)">*</span>
        ) : (
          <span className="rounded-full bg-(--surface-2) px-2 py-0.5 text-[10px] font-normal text-(--text-muted)">
            {t.optional}
          </span>
        )}
      </label>

      {question.type === 'select' && question.options ? (
        <div className={compact ? 'flex flex-wrap gap-1.5' : 'grid grid-cols-2 gap-2.5 sm:grid-cols-3'}>
          {question.options.map((opt) => {
            const selected = value === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={`rounded-xl border px-3 py-2 text-start text-sm transition ${
                  selected
                    ? 'border-(--accent) bg-(--accent)/10 text-(--text) ring-1 ring-(--accent)'
                    : 'border-(--border) bg-(--surface) text-(--text-muted) hover:border-(--accent)/50 hover:text-(--text)'
                } ${compact ? 'px-2.5 py-1.5 text-xs' : ''}`}
              >
                {opt.label[lang]}
              </button>
            )
          })}
        </div>
      ) : question.type === 'textarea' ? (
        <textarea
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={compact ? 3 : 4}
          className={inputBase}
        />
      ) : (
        <input
          autoFocus={autoFocus}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputBase}
        />
      )}
    </div>
  )
}
