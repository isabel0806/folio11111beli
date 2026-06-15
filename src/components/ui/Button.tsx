import { cn } from '@/lib/cn'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#130D10] text-white hover:bg-[#2A2025] font-semibold',
      secondary: 'border border-[#ECE8D6] bg-white text-[#130D10] hover:bg-[#FBFAF3] font-medium',
      ghost: 'text-[#6B655C] hover:bg-[#FBFAF3] font-medium',
      danger: 'bg-[#FFF0EC] text-[#C23A22] border border-[#FAD9D0] hover:bg-[#FFE6DF] font-medium',
    }
    const sizes = {
      sm: 'px-3.5 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-sm',
    }
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
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
