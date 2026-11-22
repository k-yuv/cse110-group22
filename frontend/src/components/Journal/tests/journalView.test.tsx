import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Journal from '../journalView';
import { EvidenceModel } from '../EvidenceModel';
import { JournalController } from '../JournalController';
import { CLOSE_LABEL, EMPTY_TEXT, NEXT_LABEL, NOTES_PER_SPREAD, OPEN_LABEL, PREVIOUS_LABEL } from '../journalContent';
import { addEvidence } from '../../../services/journal';

vi.mock('../../../services/journal', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/journal')>();
  return { ...actual, addEvidence: vi.fn(actual.addEvidence) };
});

interface FakeProps {
  children?: ReactNode;
  text?: string;
  onClick?: () => void;
}

// jsdom has no <canvas>, so the Konva shapes become plain HTML (see
// internal-docs/Konva-Testing.md). Group passes clicks through and Text shows
// its text, which lets these tests click the docked book itself.
vi.mock('react-konva', () => ({
  Stage: ({ children }: FakeProps) => <div>{children}</div>,
  Layer: ({ children }: FakeProps) => <div>{children}</div>,
  Group: ({ children, onClick }: FakeProps) => <div onClick={onClick}>{children}</div>,
  Rect: () => null,
  Line: () => null,
  Text: ({ text }: FakeProps) => <span>{text}</span>,
}));

function evidence(number: number) {
  return new EvidenceModel(`e${number}`, `Evidence ${number}`, `About ${number}`, '');
}

async function fillJournal(count: number) {
  for (let number = 1; number <= count; number += 1) {
    await JournalController.getInstance().add(evidence(number));
  }
}

function pageList() {
  return within(screen.getByRole('list', { name: 'Evidence on these pages' }));
}

async function openJournal() {
  const user = userEvent.setup();
  render(<Journal />);
  await user.click(screen.getByRole('button', { name: OPEN_LABEL }));
  return user;
}

describe('Journal', () => {
  beforeEach(() => {
    localStorage.clear();
    JournalController.resetInstance();
  });

  describe('docked', () => {
    it('is closed at first', () => {
      render(<Journal />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('labels the note for where it is docked', () => {
      const { unmount } = render(<Journal placement="desk" />);
      expect(screen.getByText('Evidence')).toBeInTheDocument();
      unmount();

      render(<Journal placement="corner" />);
      expect(screen.getByText('Journal')).toBeInTheDocument();
    });

    it('shows no evidence while closed', async () => {
      await fillJournal(1);

      render(<Journal />);

      expect(screen.queryByText(/Evidence 1/)).not.toBeInTheDocument();
    });

    it('opens when the drawn book is clicked', async () => {
      const user = userEvent.setup();
      render(<Journal />);

      await user.click(screen.getByText('Evidence'));

      expect(screen.getByRole('dialog', { name: 'Journal' })).toBeInTheDocument();
    });
  });

  describe('open', () => {
    it('opens from the button and shows the evidence', async () => {
      await fillJournal(1);

      await openJournal();

      expect(screen.getByRole('dialog', { name: 'Journal' })).toBeInTheDocument();
      expect(pageList().getByText('Evidence 1: About 1')).toBeInTheDocument();
    });

    it('says so when there is no evidence', async () => {
      await openJournal();

      expect(pageList().queryAllByRole('listitem')).toHaveLength(0);
      expect(within(screen.getByRole('dialog')).getAllByText(EMPTY_TEXT).length).toBeGreaterThan(0);
    });

    it('updates when another screen adds evidence', async () => {
      await openJournal();

      await act(() => JournalController.getInstance().add(evidence(1)));

      expect(pageList().getByText('Evidence 1: About 1')).toBeInTheDocument();
    });

    it('removes evidence again if saving it fails', async () => {
      vi.mocked(addEvidence).mockRejectedValueOnce(new Error('down'));
      await openJournal();

      await act(() => JournalController.getInstance().add(evidence(1)));

      expect(pageList().queryByText('Evidence 1: About 1')).not.toBeInTheDocument();
    });

    it('closes with the Close button', async () => {
      const user = await openJournal();

      await user.click(screen.getByRole('button', { name: CLOSE_LABEL }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes with the Escape key', async () => {
      const user = await openJournal();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('puts focus on Close', async () => {
      await openJournal();

      expect(screen.getByRole('button', { name: CLOSE_LABEL })).toHaveFocus();
    });

    it('has one page with no way to turn it when empty', async () => {
      await openJournal();

      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: PREVIOUS_LABEL })).toBeDisabled();
      expect(screen.getByRole('button', { name: NEXT_LABEL })).toBeDisabled();
    });

    it('keeps a full spread on one page', async () => {
      await fillJournal(NOTES_PER_SPREAD);

      await openJournal();

      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
      expect(pageList().getAllByRole('listitem')).toHaveLength(NOTES_PER_SPREAD);
    });
  });

  describe('turning pages', () => {
    it('opens on the newest evidence', async () => {
      await fillJournal(NOTES_PER_SPREAD + 1);

      await openJournal();

      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
      expect(pageList().getAllByRole('listitem')).toHaveLength(1);
      expect(pageList().getByText(/Evidence 7/)).toBeInTheDocument();
    });

    it('turns back and forward, and stops at each end', async () => {
      await fillJournal(NOTES_PER_SPREAD + 1);
      const user = await openJournal();
      const previous = screen.getByRole('button', { name: PREVIOUS_LABEL });
      const next = screen.getByRole('button', { name: NEXT_LABEL });
      expect(next).toBeDisabled();

      await user.click(previous);

      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      expect(pageList().getAllByRole('listitem')).toHaveLength(NOTES_PER_SPREAD);
      expect(previous).toBeDisabled();

      await user.click(next);

      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });

    it('opens on the newest evidence again after turning back and closing', async () => {
      await fillJournal(NOTES_PER_SPREAD + 1);
      const user = await openJournal();
      await user.click(screen.getByRole('button', { name: PREVIOUS_LABEL }));
      await user.click(screen.getByRole('button', { name: CLOSE_LABEL }));

      await user.click(screen.getByRole('button', { name: OPEN_LABEL }));

      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    });

    it('moves back a page if the last page empties while open', async () => {
      await fillJournal(NOTES_PER_SPREAD);
      await openJournal();
      vi.mocked(addEvidence).mockRejectedValueOnce(new Error('down'));

      await act(() => JournalController.getInstance().add(evidence(NOTES_PER_SPREAD + 1)));

      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    });
  });
});
