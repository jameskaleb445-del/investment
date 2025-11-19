'use client'

import { BottomNav } from '../navigation/BottomNav'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <main className="pb-28 min-h-screen overflow-x-hidden theme-bg-primary relative transition-colors">
        {children}
      </main>
      <BottomNav />
    </>
  )
}

