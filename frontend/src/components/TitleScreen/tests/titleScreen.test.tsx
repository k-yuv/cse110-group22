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
    ['Teacher\nDashboard', ROUTES.teacherDashboard],
  ])('takes %s to its configured route', async (buttonName, route) => {
    const user = userEvent.setup();
    renderTitleScreen();

    await user.click(screen.getByRole('button', { name: buttonName }));

    expect(screen.getByTestId('location')).toHaveTextContent(route);
  });

  it('renders the title artwork button text', () => {
    renderTitleScreen();

    expect(screen.getAllByRole('img', { name: 'title artwork' })).toHaveLength(2);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons.map((button) => button.textContent)).toEqual([
      'START',
      'OPTIONS',
      'Teacher\nDashboard',
    ]);
  });

  it('opens Settings when OPTIONS is clicked without navigating', async () => {
    const user = userEvent.setup();
    renderTitleScreen();

    // Click the OPTIONS button
    await user.click(
        screen.getByRole('button', { name: 'OPTIONS' })
    );

    // Settings popup should appear
    expect(
        screen.getByRole('dialog', { name: 'Settings' })
    ).toBeInTheDocument();

    // URL should remain on the title screen
    expect(
        screen.getByTestId('location')
    ).toHaveTextContent(ROUTES.title);
  });

  it('closes Settings when the X button is clicked', async () => {
    const user = userEvent.setup();
    renderTitleScreen();

    await user.click(
        screen.getByRole('button', { name: 'OPTIONS' })
    );

    await user.click(
        screen.getByRole('button', { name: 'Close popup' })
    );

    expect(
        screen.queryByRole('dialog', { name: 'Settings' })
    ).not.toBeInTheDocument();
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
