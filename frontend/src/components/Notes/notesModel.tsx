import { useEffect, useState, type FormEvent } from 'react';
import { createNote, getNotes, type Note } from '../../services/notes';

// Owns all state and service calls for the Notes component. Any context this
// component reads or writes should also be wired up here, never in the view.
export function useNotesModel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotes()
      .then(setNotes)
      .catch(() => setError('Could not load notes'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      const note = await createNote(title);
      setNotes((current) => [...current, note]);
      setTitle('');
    } catch {
      setError('Could not create note');
    }
  }

  return {
    notes,
    title,
    error,
    loading,
    onTitleChange: setTitle,
    onSubmit: handleSubmit,
  };
}
