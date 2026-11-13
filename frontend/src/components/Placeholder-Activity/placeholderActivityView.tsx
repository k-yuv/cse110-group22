import type { ActivityId } from '../../services/progress';
import { usePlaceholderActivityModel } from './placeholderActivityModel';
import { FINISH_LABEL } from './placeholderActivityContent';

interface PlaceholderActivityProps {
  activity: ActivityId;
  title: string;
}

// MOCK: stands in for an activity screen that isn't built yet. Delete it once
// every screen that uses it has been replaced.
export default function PlaceholderActivity({ activity, title }: PlaceholderActivityProps) {
  const { error, onFinish } = usePlaceholderActivityModel(activity);

  return (
    <main>
      <h1>{title}</h1>
      <p>{title} screen not built yet.</p>
      <button type="button" onClick={onFinish}>
        {FINISH_LABEL}
      </button>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
