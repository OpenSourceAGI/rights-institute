import React from 'react'
import DocumentNavigation from '@rights/site-shell/DocumentNavigation'
import GameOfLifeBackground from '@/components/animations/GameOfLifeBackground'

export default function HomePage() {
  return (
    <GameOfLifeBackground className="bg-slate-900">
      <DocumentNavigation />
    </GameOfLifeBackground>
  )
}
