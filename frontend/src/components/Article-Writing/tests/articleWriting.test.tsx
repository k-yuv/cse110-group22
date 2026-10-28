import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArticleWriting from '../articleWritingView';
import * as evidenceApi from '../../../services/evidence';
import * as articleApi from '../../../services/article';

// jsdom has no <canvas>; see internal-docs/Konva-Testing.md.
vi.mock('react-konva', () => ({
  Stage: () => null,
  Layer: () => null,
  Rect: () => null,
  Text: () => null,
  Line: () => null,
  Group: () => null,
}));

vi.mock('../../../services/evidence', () => ({
  getCollectedEvidence: vi.fn(),
}));

vi.mock('../../../services/article', () => ({
  getArticleSubjects: vi.fn(),
  submitArticle: vi.fn(),
}));

const EVIDENCE = [
  { id: 'a', title: 'Evidence A', description: '' },
  { id: 'b', title: 'Evidence B', description: '' },
  { id: 'c', title: 'Evidence C', description: '' },
];

const SUBJECTS = [
  { id: 'subject-1', prompt: 'What happened?', requiredCount: 2 },
  { id: 'subject-2', prompt: 'Who knew?', requiredCount: 1 },
];

describe('ArticleWriting component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(evidenceApi.getCollectedEvidence).mockResolvedValue(EVIDENCE);
    vi.mocked(articleApi.getArticleSubjects).mockResolvedValue(SUBJECTS);
  });

  it('shows a loading message until evidence arrives', async () => {
    render(<ArticleWriting onFinish={vi.fn()} />);

    expect(screen.getByText('Loading evidence...')).toBeInTheDocument();
    expect(await screen.findByText('0/2')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
  });

  it('counts a question as answered once it has enough evidence', async () => {
    const user = userEvent.setup();
    render(<ArticleWriting onFinish={vi.fn()} />);

    const evidenceA = await screen.findByRole('button', { name: 'Evidence A' });

    await user.click(evidenceA);
    expect(screen.getByText('0/2')).toBeInTheDocument();
    expect(evidenceA).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Evidence B' }));
    expect(screen.getByText('1/2')).toBeInTheDocument();

    await user.click(evidenceA);
    expect(screen.getByText('0/2')).toBeInTheDocument();
    expect(evidenceA).toHaveAttribute('aria-pressed', 'false');
  });

  it('only moves to the next question by submitting an answer', async () => {
    const user = userEvent.setup();
    render(<ArticleWriting onFinish={vi.fn()} />);

    const submitAnswer = await screen.findByRole('button', { name: 'Submit answer' });
    expect(screen.queryByRole('button', { name: /Next question/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '‹ Previous question' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Evidence A' }));
    expect(submitAnswer).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Evidence B' }));
    await user.click(submitAnswer);

    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit article' })).toBeInTheDocument();
  });

  it('keeps answers when going back a question', async () => {
    const user = userEvent.setup();
    render(<ArticleWriting onFinish={vi.fn()} />);

    await user.click(await screen.findByRole('button', { name: 'Evidence A' }));
    await user.click(screen.getByRole('button', { name: 'Evidence B' }));
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));

    expect(screen.getByRole('button', { name: 'Evidence A' })).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button', { name: 'Evidence C' }));
    expect(screen.getByText('2/2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '‹ Previous question' }));
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Evidence A' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Evidence B' })).toHaveAttribute('aria-pressed', 'true');

    // Re-submitting the earlier answer returns to the later one, still filled in.
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(screen.getByRole('button', { name: 'Evidence C' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Submit article' })).toBeEnabled();
  });

  it('replaces evidence in place, cycling through slots, once a question is full', async () => {
    vi.mocked(evidenceApi.getCollectedEvidence).mockResolvedValue([
      ...EVIDENCE,
      { id: 'd', title: 'Evidence D', description: '' },
    ]);
    vi.mocked(articleApi.submitArticle).mockResolvedValue({ ending: 'good' });
    const user = userEvent.setup();
    render(<ArticleWriting onFinish={vi.fn()} />);

    await user.click(await screen.findByRole('button', { name: 'Evidence A' }));
    await user.click(screen.getByRole('button', { name: 'Evidence B' }));

    // Full: C takes slot 0 (A's), then D takes slot 1 (B's).
    await user.click(screen.getByRole('button', { name: 'Evidence C' }));
    expect(screen.getByRole('button', { name: 'Evidence A' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Evidence B' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Evidence D' }));
    expect(screen.getByRole('button', { name: 'Evidence B' })).toHaveAttribute('aria-pressed', 'false');

    // Wraps back around to slot 0.
    await user.click(screen.getByRole('button', { name: 'Evidence A' }));

    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    await user.click(screen.getByRole('button', { name: 'Evidence A' }));
    await user.click(screen.getByRole('button', { name: 'Submit article' }));

    expect(articleApi.submitArticle).toHaveBeenCalledWith({
      'subject-1': ['a', 'd'],
      'subject-2': ['a'],
    });
  });

  it('submits the answers to every question and passes on the ending', async () => {
    vi.mocked(articleApi.submitArticle).mockResolvedValue({ ending: 'bad' });
    const onFinish = vi.fn();
    const user = userEvent.setup();
    render(<ArticleWriting onFinish={onFinish} />);

    await user.click(await screen.findByRole('button', { name: 'Evidence B' }));
    await user.click(screen.getByRole('button', { name: 'Evidence C' }));
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    await user.click(screen.getByRole('button', { name: 'Evidence B' }));
    await user.click(screen.getByRole('button', { name: 'Submit article' }));

    expect(articleApi.submitArticle).toHaveBeenCalledWith({
      'subject-1': ['b', 'c'],
      'subject-2': ['b'],
    });
    expect(onFinish).toHaveBeenCalledWith('bad');
  });
  it('splits long evidence lists across journal pages', async () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      id: `e${i + 1}`,
      title: `Evidence ${i + 1}`,
      description: '',
    }));
    vi.mocked(evidenceApi.getCollectedEvidence).mockResolvedValue(many);
    const user = userEvent.setup();
    render(<ArticleWriting onFinish={vi.fn()} />);

    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Evidence 8' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Evidence 9' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '‹ Previous' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Evidence 1' }));
    await user.click(screen.getByRole('button', { name: 'Next ›' }));

    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Evidence 9' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Evidence 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next ›' })).toBeDisabled();

    // Selections made on another page still count.
    await user.click(screen.getByRole('button', { name: 'Evidence 10' }));
    expect(screen.getByText('1/2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '‹ Previous' }));
    expect(screen.getByRole('button', { name: 'Evidence 1' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows an error when evidence fails to load', async () => {
    vi.mocked(evidenceApi.getCollectedEvidence).mockRejectedValue(new Error('down'));

    render(<ArticleWriting onFinish={vi.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load evidence');
  });

  it('shows an error when submitting fails', async () => {
    vi.mocked(articleApi.submitArticle).mockRejectedValue(new Error('down'));
    const onFinish = vi.fn();
    const user = userEvent.setup();
    render(<ArticleWriting onFinish={onFinish} />);

    await user.click(await screen.findByRole('button', { name: 'Evidence A' }));
    await user.click(screen.getByRole('button', { name: 'Evidence B' }));
    await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    await user.click(screen.getByRole('button', { name: 'Evidence C' }));
    await user.click(screen.getByRole('button', { name: 'Submit article' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not submit article');
    expect(onFinish).not.toHaveBeenCalled();
  });
});
