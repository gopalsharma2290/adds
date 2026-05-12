'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { PageRouter } from '@/components/layout/page-router'
import { useAppStore } from '@/stores/app-store'

export default function Home() {
  const { sidebarCollapsed } = useAppStore()

  return (
    <div className="flex min-h-screen bg-navy">
      <Sidebar />
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
      >
        <PageRouter />
      </main>
    </div>
  )
}
