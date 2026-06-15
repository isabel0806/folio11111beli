'use client'
import { cn } from '@/lib/cn'

interface FilterTabsProps {
  tabs: { value: string; label: string; count?: number }[]
  active: string
  onChange: (value: string) => void
}

export function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-0.5 p-1 bg-white rounded-full border border-[#ECE8D6] w-fit">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-3.5 py-1.5 text-sm rounded-full transition-colors',
            active === tab.value
              ? 'bg-[#F5D242] text-[#130D10] font-semibold'
              : 'text-[#8A847B] hover:text-[#130D10]'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn('ml-1.5 text-xs px-1.5 py-0.5 rounded-full', active === tab.value ? 'bg-[#130D10]/10 text-[#130D10]' : 'bg-[#F2EFE2] text-[#6B655C]')}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
