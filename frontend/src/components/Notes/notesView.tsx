import { useNotesModel } from './notesModel';

// Display only: gets everything it needs from useNotesModel. No useState,
// useEffect, or service calls belong here; add them to the model instead.
export default function Notes() {
  const { notes, title, error, loading, onTitleChange, onSubmit } = useNotesModel();

  if (loading) return <p>Loading notes...</p>;

  return (
    <section>
      <h1>Notes</h1>

      <form onSubmit={onSubmit}>
        <label htmlFor="note-title">New note</label>
        <input
          id="note-title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          required
        />
        <button type="submit">Add note</button>
      </form>

      {error && <p role="alert">{error}</p>}

      <ul>
        {notes.map((note) => (
          <li key={note.id}>{note.title}</li>
        ))}
      </ul>
    </section>
  );
}
