interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

function Sparkle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#FF5738] shrink-0" aria-hidden>
      <path d="M12 1.5c.4 4.6 1.4 5.6 6 6-4.6.4-5.6 1.4-6 6-.4-4.6-1.4-5.6-6-6 4.6-.4 5.6-1.4 6-6Z" fill="currentColor" />
    </svg>
  )
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-serif text-[34px] leading-none text-[#130D10]">{title}</h1>
          <Sparkle />
        </div>
        {description && <p className="text-[14px] text-[#8A847B] mt-2.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
