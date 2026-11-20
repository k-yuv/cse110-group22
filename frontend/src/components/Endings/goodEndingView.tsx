import EndingView from './endingView';
import ArrestScene from './scenes/ArrestScene';
import { COLORS } from '../../theme';

// Shown after a strong article: the CEO of Big Drug Inc. is arrested.
export default function GoodEnding() {
  return <EndingView ending="good" scene={<ArrestScene />} background={COLORS.wall} />;
}
