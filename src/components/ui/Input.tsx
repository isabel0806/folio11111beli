import { cn } from '@/lib/cn'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#130D10]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 text-sm border border-[#ECE8D6] rounded-lg bg-white text-[#130D10] placeholder:text-[#A8A29A]',
            'focus:outline-none focus:ring-1 focus:ring-[#F5D242] focus:border-[#F5D242]',
            error && 'border-[#FAD9D0]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#C23A22]">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#130D10]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 text-sm border border-[#ECE8D6] rounded-lg bg-white text-[#130D10]',
            'focus:outline-none focus:ring-1 focus:ring-[#F5D242] focus:border-[#F5D242]',
            error && 'border-[#FAD9D0]',
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-[#C23A22]">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#130D10]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 text-sm border border-[#ECE8D6] rounded-lg bg-white text-[#130D10] placeholder:text-[#A8A29A] resize-none',
            'focus:outline-none focus:ring-1 focus:ring-[#F5D242] focus:border-[#F5D242]',
            error && 'border-[#FAD9D0]',
            className
          )}
          rows={3}
          {...props}
        />
        {error && <p className="text-xs text-[#C23A22]">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
