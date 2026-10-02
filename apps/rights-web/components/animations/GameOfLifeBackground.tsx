/**
 * @fileoverview Game of Life page background
 *
 * Wraps a page's content with the same animated Game of Life canvas used on
 * the ethics page, pinned behind the content while it scrolls. The page's own
 * background (colour or gradient) is passed as `className` so the canvas sits
 * between that background and the content instead of being hidden by it.
 */

import React from 'react';
import GameOfLife from '@/components/animations/GameOfLife';

interface GameOfLifeBackgroundProps {
  children: React.ReactNode;
  /** Background classes for the page, painted beneath the animation. */
  className?: string;
  opacity?: number;
  blur?: number;
  delay?: number;
}

export default function GameOfLifeBackground({
  children,
  className = 'bg-slate-900',
  opacity = 0.9,
  blur = 0.2,
  delay = 0.4,
}: GameOfLifeBackgroundProps) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <GameOfLife opacity={opacity} blur={blur} delay={delay} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
