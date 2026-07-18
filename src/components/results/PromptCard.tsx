import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { getModel } from '../../lib/models'
import { copyToClipboard } from '../../lib/utils'
import { useI18n } from '../../i18n'
import type { GeneratedPrompt } from '../../lib/types'

interface Props {
  prompt: GeneratedPrompt
}

export function PromptCard({ prompt }: Props) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const model = getModel(prompt.model)

  const handleCopy = async () => {
    const ok = await copyToClipboard(prompt.content)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <div className="animate-fade-in-up rounded-2xl border border-(--border) bg-(--surface) p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: model?.color }} />
          <span className="font-semibold">{model?.name}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-3 py-1.5 text-xs font-medium transition hover:border-(--accent)/60 hover:text-(--accent)"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? t.copied : t.copy}
        </button>
      </div>
      <pre
        dir="auto"
        className="font-mono-prompt max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-(--surface-2) p-4 text-sm leading-relaxed text-(--text)"
      >
        {prompt.content}
      </pre>
    </div>
  )
}
