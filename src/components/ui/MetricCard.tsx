import { cn } from '@/lib/cn'

interface MetricCardProps {
  label: string
  value: string | number
  description?: string
  color?: 'blue' | 'red' | 'green' | 'yellow' | 'gray'
  icon?: React.ReactNode
}

export function MetricCard({ label, value, description, color = 'blue', icon }: MetricCardProps) {
  const colors = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    green: 'text-green-600',
    yellow: 'text-[#C9A800]',
    gray: 'text-gray-500',
  }
  return (
    <div className="bg-white border border-[#E5E5E3] rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={cn('text-[11px] font-semibold uppercase tracking-widest', colors[color])}>
          {label}
        </span>
        {icon && <span className={cn('mt-0.5', colors[color])}>{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-[#130D10] mb-1">{value}</div>
      {description && <div className="text-xs text-[#6B6B6B]">{description}</div>}
    </div>
  )
}
