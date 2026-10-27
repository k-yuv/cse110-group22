import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KonvaTest from '../konvaView';

// jsdom has no <canvas>, so real Konva crashes. The canvas isn't under test,
// so render nothing in its place.
vi.mock('react-konva', () => ({
  Stage: () => null,
  Layer: () => null,
  Rect: () => null,
}));

describe('KonvaTest component', () => {
  it('shows the heading and starting color', () => {
    render(<KonvaTest />);

    expect(screen.getByRole('heading', { name: 'Konva Test' })).toBeInTheDocument();
    expect(screen.getByText('Color: tomato')).toBeInTheDocument();
  });

  it('toggles the color when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<KonvaTest />);

    const button = screen.getByRole('button', { name: 'Toggle color' });

    await user.click(button);
    expect(screen.getByText('Color: steelblue')).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText('Color: tomato')).toBeInTheDocument();
  });
});
