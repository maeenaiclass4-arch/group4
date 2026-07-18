import { History, Languages, LayoutGrid, Moon, Star, Sun, Wand2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useTheme } from '../../lib/theme'

export type ViewId = 'composer' | 'history' | 'favorites' | 'templates'

interface Props {
  view: ViewId
  onNavigate: (view: ViewId) => void
}

export function Header({ view, onNavigate }: Props) {
  const { t, toggleLang } = useI18n()
  const { theme, toggleTheme } = useTheme()

  const navItems: { id: ViewId; label: string; icon: typeof Wand2 }[] = [
    { id: 'composer', label: t.nav_composer, icon: Wand2 },
    { id: 'templates', label: t.nav_templates, icon: LayoutGrid },
    { id: 'favorites', label: t.nav_favorites, icon: Star },
    { id: 'history', label: t.nav_history, icon: History },
  ]

  return (
    <header className="sticky top-0 z-20 border-b border-(--border) bg-(--bg)/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <button type="button" onClick={() => onNavigate('composer')} className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-(--accent) to-(--accent-2) text-white">
            <Wand2 size={16} />
          </span>
          <span className="hidden font-bold sm:inline">{t.appName}</span>
        </button>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = view === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active ? 'bg-(--surface-2) text-(--text)' : 'text-(--text-muted) hover:text-(--text)'
                }`}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-2.5 py-2 text-xs font-medium text-(--text-muted) transition hover:text-(--text)"
          >
            <Languages size={14} />
            <span className="hidden sm:inline">{t.lang_toggle}</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t.theme_toggle}
            className="grid size-9 place-items-center rounded-xl border border-(--border) text-(--text-muted) transition hover:text-(--text)"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  )
}
