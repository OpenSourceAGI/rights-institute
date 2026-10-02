import React from 'react'
import DocumentNavigation from '@rights/site-shell/DocumentNavigation'
import GameOfLifeBackground from '@/components/animations/GameOfLifeBackground'

export default function HomePage() {
  return (
    <GameOfLifeBackground className="bg-slate-900">
      <main className="mx-auto min-h-screen w-full max-w-6xl bg-slate-900/60 backdrop-blur-md shadow-2xl shadow-black/40 border-x border-white/10">
        <DocumentNavigation />
      </main>
    </GameOfLifeBackground>
  )
}
