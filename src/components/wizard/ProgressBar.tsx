interface Props {
  current: number
  total: number
}

export function ProgressBar({ current, total }: Props) {
  const pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--surface-2)">
      <div
        className="h-full rounded-full bg-gradient-to-r from-(--accent) to-(--accent-2) transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
