import { useLayoutEffect, useRef, useState } from 'react';
import type Konva from 'konva';
import { Group, Rect, Text } from 'react-konva';
import { FONT } from '../../../theme';
import type { EvidenceModel } from '../EvidenceModel';

interface EvidenceDetailProps {
  item: EvidenceModel;
  // Top left of the card being expanded.
  x: number;
  y: number;
  width: number;
  // The detail grows down from y, but moves up so it doesn't pass this.
  maxBottom: number;
  fill: string;
  stroke?: string;
  nameColor: string;
  descriptionColor: string;
  nameFontSize: number;
  descriptionFontSize: number;
  padding?: number;
  cornerRadius?: number;
}

// A hovered evidence card, drawn again over the cards at full size, so the
// cards themselves can stay small and cut their text short. Draw it after the
// cards so it sits on top. It ignores the mouse, so the card under it keeps
// its hover and clicks.
export default function EvidenceDetail({
  item,
  x,
  y,
  width,
  maxBottom,
  fill,
  stroke,
  nameColor,
  descriptionColor,
  nameFontSize,
  descriptionFontSize,
  padding = 10,
  cornerRadius = 6,
}: EvidenceDetailProps) {
  const nameRef = useRef<Konva.Text>(null);
  const descriptionRef = useRef<Konva.Text>(null);
  // Wrapped text heights, measured once Konva has laid the text out.
  const [nameHeight, setNameHeight] = useState(nameFontSize * 1.2);
  const [descriptionHeight, setDescriptionHeight] = useState(descriptionFontSize * 1.2);

  useLayoutEffect(() => {
    if (nameRef.current) setNameHeight(nameRef.current.height());
    if (descriptionRef.current) setDescriptionHeight(descriptionRef.current.height());
  }, [item, width, nameFontSize, descriptionFontSize]);

  const gap = 6;
  const height = padding * 2 + nameHeight + (item.toolDescription ? gap + descriptionHeight : 0);
  const top = Math.min(y, maxBottom - height);
  const textWidth = width - padding * 2;

  return (
    <Group x={x} y={top} listening={false}>
      <Rect
        width={width}
        height={height}
        cornerRadius={cornerRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={stroke ? 1 : 0}
        shadowColor="black"
        shadowOpacity={0.25}
        shadowBlur={8}
        shadowOffsetY={2}
      />
      <Text
        ref={nameRef}
        x={padding}
        y={padding}
        width={textWidth}
        text={item.toolName}
        fontFamily={FONT}
        fontStyle="bold"
        fontSize={nameFontSize}
        lineHeight={1.2}
        fill={nameColor}
        wrap="word"
      />
      {item.toolDescription && (
        <Text
          ref={descriptionRef}
          x={padding}
          y={padding + nameHeight + gap}
          width={textWidth}
          text={item.toolDescription}
          fontFamily={FONT}
          fontSize={descriptionFontSize}
          lineHeight={1.2}
          fill={descriptionColor}
          wrap="word"
        />
      )}
    </Group>
  );
}
