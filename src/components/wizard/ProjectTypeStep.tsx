import { PROJECT_TYPES } from '../../lib/projectTypes'
import type { ProjectTypeId } from '../../lib/types'
import { useI18n } from '../../i18n'
import { getIcon } from '../../lib/icons'

interface Props {
  onSelect: (id: ProjectTypeId) => void
}

export function ProjectTypeStep({ onSelect }: Props) {
  const { lang, t } = useI18n()

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold sm:text-3xl">{t.choose_type_title}</h1>
      <p className="mt-2 max-w-xl text-(--text-muted)">{t.choose_type_subtitle}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {PROJECT_TYPES.map((pt) => {
          const Icon = getIcon(pt.icon)
          return (
            <button
              key={pt.id}
              type="button"
              onClick={() => onSelect(pt.id)}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-(--border) bg-(--surface) p-5 text-start transition hover:-translate-y-0.5 hover:border-(--accent)/60 hover:shadow-lg hover:shadow-(--accent)/5"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-(--accent) to-(--accent-2) text-white transition group-hover:scale-105">
                <Icon size={20} strokeWidth={2} />
              </span>
              <span>
                <span className="block font-semibold">{pt.label[lang]}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-(--text-muted)">{pt.description[lang]}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
