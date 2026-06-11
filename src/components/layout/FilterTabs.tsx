'use client'
import { cn } from '@/lib/cn'

interface FilterTabsProps {
  tabs: { value: string; label: string; count?: number }[]
  active: string
  onChange: (value: string) => void
}

export function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-[#F9F9F8] rounded-lg border border-[#E5E5E3] w-fit">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-md transition-colors',
            active === tab.value
              ? 'bg-white text-[#130D10] font-medium shadow-sm border border-[#E5E5E3]'
              : 'text-[#6B6B6B] hover:text-[#130D10]'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn('ml-1.5 text-xs px-1.5 py-0.5 rounded-full', active === tab.value ? 'bg-[#F5D242] text-[#130D10]' : 'bg-[#E5E5E3] text-[#6B6B6B]')}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
