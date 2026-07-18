import { Pencil, Plus, Star } from 'lucide-react'
import { useI18n } from '../../i18n'
import { getProjectType } from '../../lib/projectTypes'
import { computeScore, generateSuggestions } from '../../lib/scoring'
import { getIcon } from '../../lib/icons'
import type { PromptSession } from '../../lib/types'
import { PromptCard } from './PromptCard'
import { QualityMeter } from '../insights/QualityMeter'
import { MissingInfo } from '../insights/MissingInfo'
import { Suggestions } from '../insights/Suggestions'

interface Props {
  session: PromptSession
  isFavorite: boolean
  onToggleFavorite: () => void
  onEdit: () => void
  onNew: () => void
}

export function ResultsView({ session, isFavorite, onToggleFavorite, onEdit, onNew }: Props) {
  const { lang, t } = useI18n()
  const projectType = getProjectType(session.projectType)
  if (!projectType) return null

  const result = computeScore(projectType, session.answers, session.extraNotes)
  const suggestions = generateSuggestions(projectType, session.answers, session.extraNotes, lang)
  const Icon = getIcon(projectType.icon)

  return (
    <div className="mx-auto max-w-5xl animate-fade-in-up space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--surface) p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-(--accent) to-(--accent-2) text-white">
            <Icon size={20} />
          </span>
          <div>
            <div className="font-semibold">{session.title}</div>
            <div className="text-xs text-(--text-muted)">{projectType.label[lang]}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
              isFavorite
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                : 'border-(--border) text-(--text-muted) hover:text-(--text)'
            }`}
          >
            <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? t.remove_favorite : t.save_favorite}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-3.5 py-2 text-sm font-medium text-(--text-muted) transition hover:text-(--text)"
          >
            <Pencil size={15} />
            {t.edit_answers}
          </button>
          <button
            type="button"
            onClick={onNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-(--accent) to-(--accent-2) px-3.5 py-2 text-sm font-semibold text-white transition"
          >
            <Plus size={15} />
            {t.new_prompt}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QualityMeter score={result.score} />
        <div className="sm:col-span-2">
          <MissingInfo items={result.missing} />
        </div>
      </div>

      <Suggestions suggestions={suggestions} />

      {session.generated.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-(--border) p-8 text-center text-sm text-(--text-muted)">
          {t.no_prompts_generated}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {session.generated.map((g) => (
            <PromptCard key={g.model} prompt={g} />
          ))}
        </div>
      )}
    </div>
  )
}
