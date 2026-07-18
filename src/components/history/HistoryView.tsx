import { Star, Trash2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import { getProjectType } from '../../lib/projectTypes'
import { getModel } from '../../lib/models'
import { getIcon } from '../../lib/icons'
import type { PromptSession } from '../../lib/types'

interface Props {
  sessions: PromptSession[]
  emptyMessage: string
  onView: (session: PromptSession) => void
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
}

export function HistoryView({ sessions, emptyMessage, onView, onToggleFavorite, onDelete }: Props) {
  const { lang, t } = useI18n()

  if (sessions.length === 0) {
    return (
      <div className="mx-auto max-w-lg animate-fade-in-up rounded-2xl border border-dashed border-(--border) p-10 text-center text-sm text-(--text-muted)">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in-up space-y-3">
      {sessions.map((session) => {
        const projectType = getProjectType(session.projectType)
        if (!projectType) return null
        const Icon = getIcon(projectType.icon)
        const date = new Date(session.createdAt)

        return (
          <div
            key={session.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-(--border) bg-(--surface) p-4 transition hover:border-(--accent)/40"
          >
            <button
              type="button"
              onClick={() => onView(session)}
              className="flex flex-1 items-center gap-3 text-start"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-(--accent) to-(--accent-2) text-white">
                <Icon size={17} />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{session.title}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-(--text-muted)">
                  <span>{projectType.label[lang]}</span>
                  <span>·</span>
                  <span>{date.toLocaleDateString(lang === 'ar' ? 'ar' : 'en', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>·</span>
                  <span className="font-medium text-(--accent)">{session.qualityScore}%</span>
                  <span className="flex gap-1">
                    {session.targetModels.map((m) => (
                      <span key={m} className="size-1.5 rounded-full" style={{ backgroundColor: getModel(m)?.color }} title={getModel(m)?.name} />
                    ))}
                  </span>
                </span>
              </span>
            </button>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onToggleFavorite(session.id)}
                aria-label={session.favorite ? t.remove_favorite : t.save_favorite}
                className={`grid size-9 place-items-center rounded-lg transition ${
                  session.favorite ? 'text-amber-500' : 'text-(--text-muted) hover:text-(--text)'
                }`}
              >
                <Star size={16} fill={session.favorite ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(session.id)}
                aria-label={t.delete}
                className="grid size-9 place-items-center rounded-lg text-(--text-muted) transition hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
