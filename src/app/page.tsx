'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { PageRouter } from '@/components/layout/page-router'

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 transition-all duration-300">
        <PageRouter />
      </main>
    </div>
  )
}
