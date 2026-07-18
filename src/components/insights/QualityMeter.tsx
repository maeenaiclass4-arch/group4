import { useI18n } from '../../i18n'
import { scoreLabel } from '../../lib/scoring'

interface Props {
  score: number
}

export function QualityMeter({ score }: Props) {
  const { lang, t } = useI18n()
  const color = score >= 85 ? '#3ecf8e' : score >= 65 ? '#8b7bff' : score >= 40 ? '#f0b429' : '#f2545b'

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-(--text)">{t.quality_score}</span>
        <span className="font-semibold" style={{ color }}>
          {score}% · {scoreLabel(score, lang)}
        </span>
      </div>
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-(--surface-2)">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
