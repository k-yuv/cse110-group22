import { Layer, Rect, Stage } from 'react-konva';
import { useDeskModel } from './deskModel';
import { ACTIVITY_LABELS, COLORS, CREATE_ARTICLE_LAYOUT, FOLDER_LAYOUT, MINIGAME_LAYOUT } from './deskContent';
import Folder from './parts/Folder';
import MinigameEntry from './parts/MinigameEntry';
import CreateArticleButton from './parts/CreateArticleButton';

const FOLDERS = ['articles', 'social', 'interviews'] as const;

// The hub desk the player returns to between activities. Display only: what
// is locked or done comes from useDeskModel.
export default function Desk() {
  const {
    activities,
    createArticleLocked,
    error,
    loading,
    width,
    height,
    place,
    onOpenActivity,
    onCreateArticle,
    hasNextLevel,
    onCompleteNextLevel,
    onResetProgress,
  } = useDeskModel();

  if (loading) return <p>Loading...</p>;

  return (
    <main style={{ position: 'fixed', inset: 0, background: COLORS.desk }}>
      {error && <p role="alert">{error}</p>}

      <Stage width={width} height={height}>
        <Layer>
          <Rect width={width} height={height} fill={COLORS.desk} />

          {FOLDERS.map((id) => (
            <Folder
              key={id}
              label={ACTIVITY_LABELS[id]}
              placement={place(FOLDER_LAYOUT[id])}
              note={FOLDER_LAYOUT[id].note}
              done={activities[id].done}
              locked={activities[id].locked}
              onClick={() => onOpenActivity(id)}
            />
          ))}

          <MinigameEntry
            variant="photo"
            label={ACTIVITY_LABELS.aiMinigame}
            placement={place(MINIGAME_LAYOUT.aiMinigame)}
            done={activities.aiMinigame.done}
            onClick={() => onOpenActivity('aiMinigame')}
          />
          <MinigameEntry
            variant="todo"
            label={ACTIVITY_LABELS.deskMinigame}
            placement={place(MINIGAME_LAYOUT.deskMinigame)}
            done={activities.deskMinigame.done}
            onClick={() => onOpenActivity('deskMinigame')}
          />

          <CreateArticleButton
            placement={place(CREATE_ARTICLE_LAYOUT)}
            locked={createArticleLocked}
            onClick={onCreateArticle}
          />
        </Layer>
      </Stage>

      {/* TEMPORARY: dev-only buttons for testing level progression. Never
          shown in production builds. Remove with the handlers in deskModel. */}
      {import.meta.env.DEV && (
        <div style={{ position: 'absolute', left: 16, bottom: 16, display: 'flex', gap: 8 }}>
          <button type="button" onClick={onCompleteNextLevel} disabled={!hasNextLevel}>
            Dev: complete next level
          </button>
          <button type="button" onClick={onResetProgress}>
            Dev: reset progress
          </button>
        </div>
      )}
    </main>
  );
}
