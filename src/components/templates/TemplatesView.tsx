import { useMemo, useState } from 'react'
import { Wand2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import { TEMPLATES } from '../../lib/templates'
import { PROJECT_TYPES, getProjectType } from '../../lib/projectTypes'
import { getIcon } from '../../lib/icons'
import type { ProjectTypeId, Template } from '../../lib/types'

interface Props {
  onUseTemplate: (template: Template) => void
}

export function TemplatesView({ onUseTemplate }: Props) {
  const { lang, t } = useI18n()
  const [filter, setFilter] = useState<ProjectTypeId | 'all'>('all')

  const availableTypes = useMemo(
    () => PROJECT_TYPES.filter((pt) => TEMPLATES.some((tpl) => tpl.projectType === pt.id)),
    [],
  )
  const filtered = filter === 'all' ? TEMPLATES : TEMPLATES.filter((tpl) => tpl.projectType === filter)

  return (
    <div className="mx-auto max-w-5xl animate-fade-in-up">
      <h1 className="text-2xl font-bold sm:text-3xl">{t.templates_title}</h1>
      <p className="mt-2 text-(--text-muted)">{t.templates_subtitle}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
            filter === 'all' ? 'border-(--accent) bg-(--accent)/10 text-(--text)' : 'border-(--border) text-(--text-muted) hover:text-(--text)'
          }`}
        >
          {t.all_types}
        </button>
        {availableTypes.map((pt) => (
          <button
            key={pt.id}
            type="button"
            onClick={() => setFilter(pt.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              filter === pt.id ? 'border-(--accent) bg-(--accent)/10 text-(--text)' : 'border-(--border) text-(--text-muted) hover:text-(--text)'
            }`}
          >
            {pt.label[lang]}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tpl) => {
          const pt = getProjectType(tpl.projectType)
          if (!pt) return null
          const Icon = getIcon(pt.icon)
          return (
            <div key={tpl.id} className="flex flex-col gap-3 rounded-2xl border border-(--border) bg-(--surface) p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-(--accent) to-(--accent-2) text-white">
                <Icon size={18} />
              </span>
              <div>
                <div className="font-semibold">{tpl.title[lang]}</div>
                <div className="mt-0.5 text-xs text-(--text-muted)">{tpl.subtitle[lang]}</div>
              </div>
              <span className="w-fit rounded-full bg-(--surface-2) px-2.5 py-0.5 text-[11px] text-(--text-muted)">{pt.label[lang]}</span>
              <button
                type="button"
                onClick={() => onUseTemplate(tpl)}
                className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-(--accent)/40 px-3.5 py-2 text-sm font-medium text-(--accent) transition hover:bg-(--accent)/10"
              >
                <Wand2 size={14} />
                {t.use_template}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
