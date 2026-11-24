import EndingView from './endingView';
import FiredScene from './scenes/FiredScene';
import { COLORS } from '../../theme';

// Shown after a weak article: the player loses their job.
export default function BadEnding() {
  return <EndingView ending="bad" scene={<FiredScene />} background={COLORS.streetWall} />;
}
