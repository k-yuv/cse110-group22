import { useEffect, useRef } from 'react';
import Konva from 'konva';
import { Layer, Star } from 'react-konva';
import { COLORS } from '../../../theme';
import { starArcPoint, type Side } from '../deskCleanupRules';
import {
  CELEBRATION_STARS,
  STAR_SECONDS,
  STAR_SIZE,
  STAR_SPIN,
  STAR_STAGGER_SECONDS,
} from '../deskCleanupContent';

interface CelebrationProps {
  width: number;
  height: number;
}

// Every star: its arc and which corner it leaves from. Both corners fire the
// same arcs at once, mirrored.
const STARS = (['left', 'right'] as Side[]).flatMap((side) =>
  CELEBRATION_STARS.map((arc, order) => ({ arc, side, order })),
);

// Stars that shoot out of both bottom corners in an arc and fall back down
// off screen, played once when it appears. From each corner, each star leaves
// a little after the one before. Konva moves them every frame, so this
// doesn't re-render React.
export default function Celebration({ width, height }: CelebrationProps) {
  const starRefs = useRef<(Konva.Star | null)[]>([]);
  const radius = (STAR_SIZE * height) / 2;

  useEffect(() => {
    const layer = starRefs.current[0]?.getLayer();
    if (!layer) return;

    const totalSeconds = STAR_SECONDS + STAR_STAGGER_SECONDS * (CELEBRATION_STARS.length - 1);
    // Lands this far below the bottom edge, so the whole star is off screen.
    const endBelow = (radius * 2) / height;

    const animation = new Konva.Animation((frame) => {
      const seconds = (frame?.time ?? 0) / 1000;

      STARS.forEach(({ arc, side, order }, index) => {
        const star = starRefs.current[index];
        if (!star) return;

        const progress = Math.min(1, Math.max(0, (seconds - order * STAR_STAGGER_SECONDS) / STAR_SECONDS));
        const { x, y } = starArcPoint(progress, arc, endBelow, side);
        star.position({ x: x * width, y: y * height });
        // Each side spins the way it's flying.
        star.rotation(progress * STAR_SPIN * (side === 'left' ? 1 : -1));
        star.visible(progress > 0 && progress < 1);
      });

      if (seconds >= totalSeconds) animation.stop();
    }, layer);

    animation.start();
    return () => {
      animation.stop();
    };
  }, [width, height, radius]);

  return (
    <Layer listening={false}>
      {STARS.map(({ arc, side }, index) => (
        <Star
          key={`${side}-${arc.travel}`}
          ref={(node) => {
            starRefs.current[index] = node;
          }}
          visible={false}
          numPoints={5}
          outerRadius={radius}
          innerRadius={radius * 0.45}
          fill={COLORS.star}
          stroke={COLORS.starOutline}
          strokeWidth={radius * 0.08}
          lineJoin="round"
        />
      ))}
    </Layer>
  );
}
