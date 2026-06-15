import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex bg-[#0F0F0F]">
      <DashboardSidebar />
      <main className="flex-1 ml-[200px] min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
