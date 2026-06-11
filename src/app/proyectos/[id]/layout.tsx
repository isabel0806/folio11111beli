'use client'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { mockProjects } from '@/lib/mock-data'
import { getProjectStatusColor, getProjectStatusLabel, getProjectTypeLabel } from '@/lib/utils'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'
import { IconChevronRight } from '@tabler/icons-react'

const tabs = [
  { href: 'archivos', label: 'Archivos' },
  { href: 'control', label: 'Control' },
  { href: 'finanzas', label: 'Finanzas' },
  { href: 'configuracion', label: 'Configuración' },
]

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams() as { id: string }
  const pathname = usePathname()
  const project = mockProjects.find(p => p.id === id)

  if (!project) {
    return <div className="p-8 text-[#6B6B6B]">Proyecto no encontrado.</div>
  }

  const activeTab = tabs.find(t => pathname.includes(t.href))?.href || 'archivos'

  return (
    <div className="flex flex-col min-h-screen">
      {/* Project header */}
      <div className="bg-white border-b border-[#E5E5E3] px-8 pt-6 pb-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#9B9B9B] mb-4">
          <Link href="/proyectos" className="hover:text-[#130D10]">Proyectos</Link>
          <IconChevronRight size={12} />
          <span className="text-[#130D10]">{project.name}</span>
        </div>

        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-[#130D10]" style={{ backgroundColor: project.cover_color }}>
              {project.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#130D10]">{project.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-md ${getProjectStatusColor(project.status)}`}>
                  {getProjectStatusLabel(project.status)}
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] mt-0.5">{project.client_name} · {getProjectTypeLabel(project.type)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-[#9B9B9B]">Avance</p>
              <div className="flex items-center gap-2 mt-1">
                <ProgressBar value={project.progress || 0} className="w-24" />
                <span className="text-xs font-medium text-[#130D10]">{project.progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map(tab => (
            <Link key={tab.href} href={`/proyectos/${id}/${tab.href}`}>
              <div className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.href
                  ? 'border-[#F5D242] text-[#130D10]'
                  : 'border-transparent text-[#6B6B6B] hover:text-[#130D10]'
              )}>
                {tab.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex-1 p-8 bg-[#F9F9F8]">
        {children}
      </div>
    </div>
  )
}
