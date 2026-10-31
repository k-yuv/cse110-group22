import { Rect, Text } from 'react-konva';
import StickyNote from './StickyNote';
import DeskItem from './DeskItem';
import { COLORS, CREATE_ARTICLE_LABEL, LOCKED_TEXT, type PixelPlacement } from '../deskContent';

interface CreateArticleButtonProps {
  placement: PixelPlacement;
  locked: boolean;
  onClick: () => void;
}

export default function CreateArticleButton({ placement, locked, onClick }: CreateArticleButtonProps) {
  const w = placement.width;

  return (
    <DeskItem
      name={CREATE_ARTICLE_LABEL}
      placement={placement}
      height={w * 0.51}
      cornerRadius={w * 0.056}
      locked={locked}
      onClick={onClick}
    >
      {/* Create article box */}
      <Rect width={w} height={w * 0.51} cornerRadius={w * 0.056} fill={COLORS.createArticle} />
      {/* Create article text */}
      <Text text={`${CREATE_ARTICLE_LABEL} →`} x={w * 0.07} y={w * 0.14} fontSize={w * 0.113} fontStyle="bold" fill={COLORS.text} />
      {/* Pen */}
      <Rect x={w * 0.12} y={-w * 0.23} width={w * 0.06} height={w * 0.48} cornerRadius={w * 0.03} rotation={30} fill={COLORS.pen} />
      {/* Sticky note */}
      {locked && (
        <StickyNote text={LOCKED_TEXT} color={COLORS.lockedNote} x={w * 0.17} y={-w * 0.15} size={w * 0.31} rotation={12} />
      )}
    </DeskItem>
  );
}
