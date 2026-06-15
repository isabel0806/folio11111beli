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
    blue: 'text-[#3F6FA3]',
    red: 'text-[#C23A22]',
    green: 'text-[#00846F]',
    yellow: 'text-[#7A6410]',
    gray: 'text-[#8A847B]',
  }
  return (
    <div className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[18px] p-5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={cn('text-[11px] font-semibold uppercase tracking-[0.12em]', colors[color])}>
          {label}
        </span>
        {icon && <span className={cn('mt-0.5', colors[color])}>{icon}</span>}
      </div>
      <div className="font-serif text-[27px] leading-none text-[#130D10] mb-1">{value}</div>
      {description && <div className="text-[12px] text-[#8A847B]">{description}</div>}
    </div>
  )
}
