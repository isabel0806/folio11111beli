interface ProgressBarProps {
  value: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value, className, showLabel }: ProgressBarProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 bg-[#F0F0EE] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#F5D242] rounded-full transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-[#6B6B6B] w-8 text-right">{value}%</span>}
    </div>
  )
}
