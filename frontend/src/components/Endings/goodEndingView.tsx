import EndingView from './endingView';
import goodEndingImage from '../../assets/GoodEnding.png';
import { COLORS } from '../../theme';

// Shown after a strong article: the CEO of Big Drug Inc. is arrested.
export default function GoodEnding() {
  return (
    <EndingView
      ending="good"
      backgroundImage={goodEndingImage}
      background={COLORS.goodEndingBackdrop}
      panelSide="right"
    />
  );
}
