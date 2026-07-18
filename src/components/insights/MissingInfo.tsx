import { AlertTriangle } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { MissingInfoItem } from '../../lib/scoring'

interface Props {
  items: MissingInfoItem[]
  onJump?: (questionId: string) => void
}

export function MissingInfo({ items, onJump }: Props) {
  const { lang, t } = useI18n()
  if (items.length === 0) return null

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-500">
        <AlertTriangle size={16} />
        {t.missing_info}
      </div>
      <p className="mt-1 text-xs text-(--text-muted)">{t.missing_info_desc}</p>
      <ul className="mt-2.5 flex flex-wrap gap-1.5">
        {items.map(({ question }) => (
          <li key={question.id}>
            <button
              type="button"
              onClick={() => onJump?.(question.id)}
              disabled={!onJump}
              className="rounded-full border border-amber-500/30 bg-(--surface) px-2.5 py-1 text-xs text-amber-500 transition hover:bg-amber-500/10 disabled:cursor-default"
            >
              {question.label[lang]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
