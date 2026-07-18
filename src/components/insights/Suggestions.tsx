import { Lightbulb } from 'lucide-react'
import { useI18n } from '../../i18n'

interface Props {
  suggestions: string[]
}

export function Suggestions({ suggestions }: Props) {
  const { t } = useI18n()
  if (suggestions.length === 0) return null

  return (
    <div className="rounded-2xl border border-(--accent)/25 bg-(--accent)/[0.06] p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-(--accent)">
        <Lightbulb size={16} />
        {t.ai_suggestions}
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {suggestions.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-(--text-muted)">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-(--accent)" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  )
}
