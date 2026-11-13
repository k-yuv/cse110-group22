import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import ArticleWriting from '../articleWritingView';
import { EvidenceModel } from '../../Journal/EvidenceModel';
import { JournalController } from '../../Journal/JournalController';
import * as articleApi from '../../../services/article';

// jsdom can't draw a canvas, so unlike the other tests here, these fakes render
// Konva groups and text as plain elements. That lets us check the evidence
// cards' text and click/tap/hover handlers, not how anything is drawn.
const konva = vi.hoisted(() => ({ stageContainer: null as HTMLElement | null }));

vi.mock('react-konva', () => {
  type Handler = (event: unknown) => void;
  const event = () => ({ target: { getStage: () => (konva.stageContainer ? { container: () => konva.stageContainer } : null) } });
  return {
    Stage: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Layer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Rect: () => null,
    Line: () => null,
    Text: ({ text }: { text: string }) => <span>{text}</span>,
    Group: ({ children, onClick, onTap, onMouseEnter, onMouseLeave }: {
      children: ReactNode; onClick: Handler; onTap: Handler; onMouseEnter: Handler; onMouseLeave: Handler;
    }) => (
      <div
        data-testid="evidence-card"
        onClick={() => onClick(event())}
        onTouchEnd={() => onTap(event())}
        onMouseEnter={() => onMouseEnter(event())}
        onMouseLeave={() => onMouseLeave(event())}
      >
        {children}
      </div>
    ),
  };
});

vi.mock('../../../services/article', () => ({
  getArticleSubjects: vi.fn(),
  submitArticle: vi.fn(),
}));

const SUBJECTS = [{ id: 'subject-1', prompt: 'What happened?', requiredCount: 2 }];

function cards() {
  return screen.getAllByTestId('evidence-card');
}

describe('ArticleWriting canvas cards', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    konva.stageContainer = document.createElement('div');
    const journal = JournalController.getInstance();
    journal.clear();
    journal.add(new EvidenceModel('a', 'Evidence A', 'About A', ''));
    journal.add(new EvidenceModel('b', 'Evidence B', 'About B', ''));
    vi.mocked(articleApi.getArticleSubjects).mockResolvedValue(SUBJECTS);
  });

  it('shows the prompt and instructions on the laptop before anything is picked', async () => {
    render(<ArticleWriting onFinish={vi.fn()} onBack={vi.fn()} />);

    expect(await screen.findByText('What happened?')).toBeInTheDocument();
    expect(screen.getByText('Evidence 0/2')).toBeInTheDocument();
    expect(screen.getByText('Submit 2 pieces of evidence.')).toBeInTheDocument();
    expect(cards()).toHaveLength(2);
    expect(within(cards()[0]).getByText('Evidence A')).toBeInTheDocument();
    expect(within(cards()[0]).getByText('About A')).toBeInTheDocument();
  });

  it('selects evidence when its journal card is clicked and shows it on the laptop', async () => {
    render(<ArticleWriting onFinish={vi.fn()} onBack={vi.fn()} />);
    await screen.findByText('What happened?');

    fireEvent.click(cards()[0]);

    expect(screen.getByText('Evidence 1/2')).toBeInTheDocument();
    expect(screen.queryByText('Submit 2 pieces of evidence.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Evidence A' })).toHaveAttribute('aria-pressed', 'true');

    // The laptop copy is compact (title only), the journal copy keeps its description.
    const selected = cards().filter((card) => within(card).queryByText('✓ Evidence A'));
    expect(selected).toHaveLength(2);
    expect(selected.filter((card) => within(card).queryByText('About A'))).toHaveLength(1);
  });

  it('removes evidence when its card on the laptop is clicked', async () => {
    render(<ArticleWriting onFinish={vi.fn()} onBack={vi.fn()} />);
    await screen.findByText('What happened?');

    fireEvent.click(cards()[0]);
    // Laptop cards are drawn before the journal, so the first card is the laptop's.
    fireEvent.click(cards()[0]);

    expect(screen.getByText('Evidence 0/2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Evidence A' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('selects evidence on tap', async () => {
    render(<ArticleWriting onFinish={vi.fn()} onBack={vi.fn()} />);
    await screen.findByText('What happened?');

    fireEvent.touchEnd(cards()[1]);

    expect(screen.getByRole('button', { name: 'Evidence B' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows a pointer cursor while hovering a card', async () => {
    render(<ArticleWriting onFinish={vi.fn()} onBack={vi.fn()} />);
    await screen.findByText('What happened?');

    fireEvent.mouseEnter(cards()[0]);
    expect(konva.stageContainer?.style.cursor).toBe('pointer');

    fireEvent.mouseLeave(cards()[0]);
    expect(konva.stageContainer?.style.cursor).toBe('default');
  });

  it('does nothing on hover when the card is not on a stage', async () => {
    konva.stageContainer = null;
    render(<ArticleWriting onFinish={vi.fn()} onBack={vi.fn()} />);
    await screen.findByText('What happened?');

    expect(() => {
      fireEvent.mouseEnter(cards()[0]);
      fireEvent.mouseLeave(cards()[0]);
    }).not.toThrow();
  });
});
