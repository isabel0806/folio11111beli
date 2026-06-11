import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/cn'

interface AvatarProps {
  name: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-7 h-7 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' }

const colors = ['#FFF9D6', '#D5E8F4', '#D5F4E8', '#F4D5E8', '#E8E0F4']

function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({ name, src, size = 'md', color, className }: AvatarProps) {
  const bg = color || stringToColor(name)
  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />
  }
  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-semibold text-[#130D10] shrink-0', sizes[size], className)}
      style={{ backgroundColor: bg }}
    >
      {getInitials(name)}
    </div>
  )
}
