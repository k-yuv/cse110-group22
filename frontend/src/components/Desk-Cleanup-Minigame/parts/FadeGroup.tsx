import { useEffect, useRef, type ReactNode } from 'react';
import { Group } from 'react-konva';
import type Konva from 'konva';

const FADE_SECONDS = 0.3;

interface FadeGroupProps {
  opacity: number;
  children: ReactNode;
}

// Shows its children at the given opacity. Reaching 0 fades them out instead
// of making them vanish, so a cleaned mess visibly finishes disappearing.
// Animated with a Konva tween rather than React state, like HoverSpotlight.
export default function FadeGroup({ opacity, children }: FadeGroupProps) {
  const groupRef = useRef<Konva.Group>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    if (opacity === 0) group.to({ opacity: 0, duration: FADE_SECONDS });
    else group.opacity(opacity);
  }, [opacity]);

  // A cleaned mess ignores the mouse, so it can't be clicked while it fades.
  return (
    <Group ref={groupRef} listening={opacity > 0}>
      {children}
    </Group>
  );
}
