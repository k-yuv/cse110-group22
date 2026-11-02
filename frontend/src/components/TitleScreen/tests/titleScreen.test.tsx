import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import App from '../../../App';
import { ROUTES } from '../../../routes';
import TitleScreen from '../titleScreenView';

vi.mock('react-konva', () => ({
  Stage: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Layer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../titleButton', () => ({
  default: ({
    text,
    x,
    y,
    onClick,
  }: {
    text: string;
    x: number;
    y: number;
    onClick?: () => void;
  }) => (
    <button data-x={x} data-y={y} onClick={onClick}>
      {text}
    </button>
  ),
}));

vi.mock('../../URLImage/URLImage', () => ({
  URLImage: ({ src }: { src: string }) => <img alt="title artwork" src={src} />,
}));

vi.mock('../../Desk/deskView', () => ({
  default: () => <h1>Central View</h1>,
}));

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
}

function renderTitleScreen() {
  return render(
    <MemoryRouter initialEntries={[ROUTES.title]}>
      <TitleScreen />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe('TitleScreen', () => {
  it.each([
    ['START', ROUTES.desk],
    ['OPTIONS', ROUTES.options],
    ['Teacher\nDashboard', ROUTES.teacherDashboard],
  ])('takes %s to its configured route', async (buttonName, route) => {
    const user = userEvent.setup();
    renderTitleScreen();

    await user.click(screen.getByRole('button', { name: buttonName }));

    expect(screen.getByTestId('location')).toHaveTextContent(route);
  });

  it('renders the title artwork and all three buttons in their configured positions', () => {
    renderTitleScreen();

    expect(screen.getAllByRole('img', { name: 'title artwork' })).toHaveLength(2);

    const scale = Math.min(window.innerWidth / 410, window.innerHeight / 877);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons.map((button) => button.textContent)).toEqual([
      'START',
      'OPTIONS',
      'Teacher\nDashboard',
    ]);
    expect(buttons.map((button) => Number(button.dataset.x))).toEqual([
      200 * scale,
      200 * scale,
      35 * scale,
    ]);
    expect(buttons.map((button) => Number(button.dataset.y))).toEqual([
      400 * scale,
      530 * scale,
      700 * scale,
    ]);
  });
});

describe('App title-screen integration', () => {
  it('loads on the title screen and START opens Central View', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('button', { name: 'START' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'START' }));

    expect(screen.getByRole('heading', { name: 'Central View' })).toBeInTheDocument();
  });
});
