import { cn } from '@/lib/cn'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#F5D242] text-[#130D10] hover:bg-[#f0ca30] font-medium',
      secondary: 'border border-[#E5E5E3] bg-white text-[#4B4B4B] hover:bg-[#F9F9F8]',
      ghost: 'text-[#6B6B6B] hover:bg-[#F9F9F8]',
      danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
    }
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-sm',
    }
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
