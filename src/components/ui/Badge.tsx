import { cn } from '@/lib/cn'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral' | 'info'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-[#F2EFE2] text-[#6B655C]',
    success: 'bg-[#E5F3EF] text-[#00846F]',
    warning: 'bg-[#FBF3D6] text-[#7A6410]',
    danger: 'bg-[#FFE6DF] text-[#C23A22]',
    neutral: 'bg-[#F2EFE2] text-[#8A847B]',
    info: 'bg-[#EAF2FB] text-[#3F6FA3]',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
