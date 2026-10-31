import { useRef, type ReactNode } from 'react';
import { Group, Rect } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { COLORS } from '../../../theme';

const HOVER_SCALE = 1.06;
const HOVER_SECONDS = 0.15;

interface HoverSpotlightProps {
  // Size of the area that glows. Children are drawn from its top left.
  width: number;
  height: number;
  cornerRadius?: number;
  // Disabled items don't react, and show a "not allowed" cursor instead.
  disabled?: boolean;  
  children: ReactNode;
}

function setCursor(event: KonvaEventObject<MouseEvent>, cursor: string) {
  const container = event.target.getStage()?.container();
  if (container) container.style.cursor = cursor;
}

// Wrap anything clickable in this: on hover it grows slightly and a soft
// light appears behind it. Animated with Konva tweens rather than React
// state, so hovering doesn't re-render anything.
export default function HoverSpotlight({ width, height, cornerRadius = 0, disabled, children }: HoverSpotlightProps) {
  const groupRef = useRef<Konva.Group>(null);
  const glowRef = useRef<Konva.Rect>(null);

  function animate(hovered: boolean) {
    const scale = hovered ? HOVER_SCALE : 1;
    groupRef.current?.to({ scaleX: scale, scaleY: scale, duration: HOVER_SECONDS });
    glowRef.current?.to({ opacity: hovered ? 1 : 0, duration: HOVER_SECONDS });
  }

  function handleMouseEnter(event: KonvaEventObject<MouseEvent>) {
    setCursor(event, disabled ? 'not-allowed' : 'pointer');
    if (!disabled) animate(true);
  }

  function handleMouseLeave(event: KonvaEventObject<MouseEvent>) {
    setCursor(event, 'default');
    animate(false);
  }

  return (
    // Placed at its center so it grows outward from the middle.
    <Group
      ref={groupRef}
      x={width / 2}
      y={height / 2}
      offsetX={width / 2}
      offsetY={height / 2}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Rect
        ref={glowRef}
        width={width}
        height={height}
        cornerRadius={cornerRadius}
        fill={COLORS.hoverGlow}
        shadowColor={COLORS.hoverGlow}
        shadowBlur={Math.max(width, height) * 0.15}
        shadowOpacity={1}
        opacity={0}
        listening={false}
      />
      {children}
    </Group>
  );
}
