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
  getArticleSubject: vi.fn(),
  submitArticle: vi.fn(),
}));

const EVIDENCE = [
  { id: 'a', title: 'Evidence A', description: '' },
  { id: 'b', title: 'Evidence B', description: '' },
  { id: 'c', title: 'Evidence C', description: '' },
];

const SUBJECT = { id: 'subject-1', prompt: 'What happened?', requiredCount: 2 };

describe('ArticleWriting component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(evidenceApi.getCollectedEvidence).mockResolvedValue(EVIDENCE);
    vi.mocked(articleApi.getArticleSubject).mockResolvedValue(SUBJECT);
  });

  it('shows a loading message until evidence arrives', async () => {
    render(<ArticleWriting onFinish={vi.fn()} />);

    expect(screen.getByText('Loading evidence...')).toBeInTheDocument();
    expect(await screen.findByText('0/2')).toBeInTheDocument();
  });

  it('updates progress when evidence is selected and deselected', async () => {
    const user = userEvent.setup();
    render(<ArticleWriting onFinish={vi.fn()} />);

    const evidenceA = await screen.findByRole('button', { name: 'Evidence A' });
    const evidenceB = screen.getByRole('button', { name: 'Evidence B' });

    await user.click(evidenceA);
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(evidenceA).toHaveAttribute('aria-pressed', 'true');

    await user.click(evidenceB);
    expect(screen.getByText('2/2')).toBeInTheDocument();

    await user.click(evidenceA);
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(evidenceA).toHaveAttribute('aria-pressed', 'false');
  });

  it('stops selecting once the article is full', async () => {
    const user = userEvent.setup();
    render(<ArticleWriting onFinish={vi.fn()} />);

    await user.click(await screen.findByRole('button', { name: 'Evidence A' }));
    await user.click(screen.getByRole('button', { name: 'Evidence B' }));

    expect(screen.getByRole('button', { name: 'Evidence C' })).toBeDisabled();
  });

  it('only allows submitting once enough evidence is selected', async () => {
    const user = userEvent.setup();
    render(<ArticleWriting onFinish={vi.fn()} />);

    const submit = await screen.findByRole('button', { name: 'Submit article' });
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Evidence A' }));
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Evidence B' }));
    expect(submit).toBeEnabled();
  });

  it('submits the selected evidence and passes on the ending', async () => {
    vi.mocked(articleApi.submitArticle).mockResolvedValue({ ending: 'bad' });
    const onFinish = vi.fn();
    const user = userEvent.setup();
    render(<ArticleWriting onFinish={onFinish} />);

    await user.click(await screen.findByRole('button', { name: 'Evidence B' }));
    await user.click(screen.getByRole('button', { name: 'Evidence C' }));
    await user.click(screen.getByRole('button', { name: 'Submit article' }));

    expect(articleApi.submitArticle).toHaveBeenCalledWith('subject-1', ['b', 'c']);
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
    expect(screen.getByText('2/2')).toBeInTheDocument();

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
    await user.click(screen.getByRole('button', { name: 'Submit article' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not submit article');
    expect(onFinish).not.toHaveBeenCalled();
  });
});
