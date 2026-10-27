import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Notes from '../notesView';
import * as notesApi from '../../../services/notes';

// Mock the API Calls
vi.mock('../../../services/notes', () => ({
  getNotes: vi.fn(),
  createNote: vi.fn(),
}));

describe('Notes component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows a loading message until notes arrive', async () => {
    vi.mocked(notesApi.getNotes).mockResolvedValue([]);

    render(<Notes />);

    expect(screen.getByText('Loading notes...')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Add note' })).toBeInTheDocument();
    expect(screen.queryByText('Loading notes...')).not.toBeInTheDocument();
  });

  it('displays notes and lets the user add one', async () => {
    vi.mocked(notesApi.getNotes).mockResolvedValue([
      { id: crypto.randomUUID(), title: 'Existing note', created_at: '' },
    ]);

    vi.mocked(notesApi.createNote).mockResolvedValue({
      id: crypto.randomUUID(),
      title: 'New note',
      created_at: '',
    });

    const user = userEvent.setup();
    render(<Notes />);

    expect(await screen.findByText('Existing note')).toBeInTheDocument();

    await user.type(screen.getByLabelText('New note'), 'New note');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(await screen.findByText('New note', { selector: 'li' })).toBeInTheDocument();
    expect(screen.getByLabelText('New note')).toHaveValue('');

    await waitFor(() => {
      expect(notesApi.createNote).toHaveBeenCalledWith('New note');
    });
  });

  it('shows an error when notes fail to load', async () => {
    vi.mocked(notesApi.getNotes).mockRejectedValue(new Error('down'));

    render(<Notes />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load notes');
  });

  it('shows an error when creating a note fails', async () => {
    vi.mocked(notesApi.getNotes).mockResolvedValue([]);
    vi.mocked(notesApi.createNote).mockRejectedValue(new Error('down'));

    const user = userEvent.setup();
    render(<Notes />);

    await user.type(await screen.findByLabelText('New note'), 'Broken');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not create note');
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
