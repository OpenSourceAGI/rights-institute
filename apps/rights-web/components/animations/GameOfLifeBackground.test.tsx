import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/components/animations/GameOfLife', () => ({
  default: (props: { opacity: number; blur: number; delay: number }) => (
    <canvas data-testid="game-of-life" data-opacity={props.opacity} data-delay={props.delay} />
  ),
}));

const { default: GameOfLifeBackground } = await import('./GameOfLifeBackground');

describe('GameOfLifeBackground', () => {
  it('renders the content above a fixed, non-interactive Game of Life layer', () => {
    render(
      <GameOfLifeBackground>
        <p>Page content</p>
      </GameOfLifeBackground>
    );

    const canvas = screen.getByTestId('game-of-life');
    const layer = canvas.parentElement!;
    expect(layer).toHaveClass('fixed', 'pointer-events-none');
    expect(layer).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Page content').parentElement).toHaveClass('relative', 'z-10');
  });

  it('paints the page background passed as className, defaulting to slate', () => {
    const { container, rerender } = render(<GameOfLifeBackground>x</GameOfLifeBackground>);
    expect(container.firstChild).toHaveClass('min-h-screen', 'bg-slate-900');

    rerender(<GameOfLifeBackground className="bg-purple-900">x</GameOfLifeBackground>);
    expect(container.firstChild).toHaveClass('bg-purple-900');
    expect(container.firstChild).not.toHaveClass('bg-slate-900');
  });

  it('passes the animation settings through to GameOfLife', () => {
    render(<GameOfLifeBackground opacity={0.5} delay={1}>x</GameOfLifeBackground>);
    const canvas = screen.getByTestId('game-of-life');
    expect(canvas).toHaveAttribute('data-opacity', '0.5');
    expect(canvas).toHaveAttribute('data-delay', '1');
  });
});
