import { describe, it, expect, vi } from 'vitest';
import type { ComponentType } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import GoodEnding from '../goodEndingView';
import BadEnding from '../badEndingView';
import { ENDING_CONTENT, RETURN_TO_TITLE_TEXT } from '../endingContent';
import type { ArticleEnding } from '../../../services/article';
import { ROUTES } from '../../../routes';

// jsdom has no <canvas>; see internal-docs/Konva-Testing.md. The scenes are
// checked by eye in the browser.
vi.mock('react-konva', () => ({
  Stage: () => null,
  Layer: () => null,
  Group: () => null,
  Rect: () => null,
  Circle: () => null,
  Ellipse: () => null,
  Line: () => null,
  Text: () => null,
  Wedge: () => null,
  Image: () => null,
}));

function CurrentPath() {
  return <output>{useLocation().pathname}</output>;
}

const ENDINGS: [ArticleEnding, string, ComponentType][] = [
  ['good', ROUTES.goodEnding, GoodEnding],
  ['bad', ROUTES.badEnding, BadEnding],
];

describe.each(ENDINGS)('%s ending', (ending, path, Ending) => {
  const content = ENDING_CONTENT[ending];

  // Opens the ending's URL directly, as if typed into the address bar.
  function renderEnding() {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={<Ending />} />
          <Route path={ROUTES.title} element={<h1>Title Screen</h1>} />
        </Routes>
        <CurrentPath />
      </MemoryRouter>,
    );
  }

  it('shows its headline and why the article turned out this way', () => {
    renderEnding();

    const headline = [content.headline, content.headlineAside].filter(Boolean).join(' ');
    expect(screen.getByRole('heading', { level: 1, name: headline })).toBeInTheDocument();
    expect(screen.getByText(content.subheadline)).toBeInTheDocument();
    expect(screen.getByText(content.message)).toBeInTheDocument();
  });

  it('returns to the Title Screen', async () => {
    const user = userEvent.setup();
    renderEnding();

    await user.click(screen.getByRole('button', { name: RETURN_TO_TITLE_TEXT }));

    expect(screen.getByRole('status').textContent).toBe(ROUTES.title);
    expect(screen.getByRole('heading', { name: 'Title Screen' })).toBeInTheDocument();
  });
});
