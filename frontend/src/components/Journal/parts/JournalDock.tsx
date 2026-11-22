import { Group, Layer, Rect, Stage, Text } from 'react-konva';
import { COLORS, FONT } from '../../../theme';
import HoverSpotlight from '../../Desk/parts/HoverSpotlight';
import { BOOK, DOCK_NOTE, JOURNAL_PLACEMENTS, type JournalPlacementName } from '../journalContent';
import { dockBounds } from '../journalRules';
import JournalBook from './JournalBook';

interface JournalDockProps {
  placement: JournalPlacementName;
  windowWidth: number;
  windowHeight: number;
  sizeUnit: number;
  onOpen: () => void;
}

// The closed journal. It has its own small canvas on top of the screen, so any
// screen can show it without drawing it.
export default function JournalDock({ placement, windowWidth, windowHeight, sizeUnit, onOpen }: JournalDockProps) {
  const layout = JOURNAL_PLACEMENTS[placement];
  const bounds = dockBounds(layout, windowWidth, windowHeight, sizeUnit);
  const width = layout.width * sizeUnit;
  const height = (width * BOOK.height) / BOOK.width;
  const noteHalf = DOCK_NOTE.size / 2;

  return (
    <div style={{ position: 'fixed', left: bounds.x, top: bounds.y, zIndex: 1 }}>
      <Stage width={bounds.width} height={bounds.height}>
        <Layer>
          <Group
            x={layout.x * windowWidth - bounds.x}
            y={layout.y * windowHeight - bounds.y}
            offsetX={width / 2}
            offsetY={height / 2}
            rotation={layout.rotation}
            onClick={onOpen}
            onTap={onOpen}
          >
            <HoverSpotlight width={width} height={height} cornerRadius={width * 0.05}>
              <JournalBook width={width}>
                <Group x={DOCK_NOTE.x} y={DOCK_NOTE.y} rotation={DOCK_NOTE.rotation}>
                  <Rect x={-noteHalf} y={-noteHalf} width={DOCK_NOTE.size} height={DOCK_NOTE.size} fill={COLORS.journalNote} />
                  <Text
                    x={-noteHalf}
                    y={-noteHalf}
                    width={DOCK_NOTE.size}
                    height={DOCK_NOTE.size}
                    text={layout.label}
                    align="center"
                    verticalAlign="middle"
                    fontFamily={FONT}
                    fontStyle="bold"
                    fontSize={DOCK_NOTE.fontSize}
                    fill={COLORS.journalText}
                  />
                </Group>
              </JournalBook>
            </HoverSpotlight>
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}
