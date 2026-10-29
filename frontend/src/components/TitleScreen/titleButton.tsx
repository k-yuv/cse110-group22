import { useEffect, useRef, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type Konva from 'konva';

interface TitleButtonProps {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
}

export default function TitleButton({
    text,
    x,
    y,
    width,
    height,
    fontSize = 40,
}: TitleButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    const groupRef = useRef<Konva.Group>(null);

    useEffect(() => {
        groupRef.current?.to({
            scaleX: isHovered ? 1.05 : 1,
            scaleY: isHovered ? 1.05 : 1,
            duration: 0.15,
        });
    }, [isHovered]);

    return (
        <Group
            ref={groupRef}
            x={x + width / 2}
            y={y + height / 2}
            offsetX={width / 2}
            offsetY={height / 2}
            onMouseEnter={(event) => {
                setIsHovered(true);
                event.target.getStage()?.container().style.setProperty('cursor', 'pointer');
            }}
            onMouseLeave={(event) => {
                setIsHovered(false);
                event.target.getStage()?.container().style.removeProperty('cursor');
            }}
        >
            <Rect
                width={width}
                height={height}
                fill="#F7FCFD"
                stroke="#6FB3F3"
                strokeWidth={8}
                cornerRadius={height * (40 / 92)}
            />
            <Text
                text={text}
                align="center"
                verticalAlign="middle"
                fontSize={fontSize}
                fontFamily="Coiny"
                fill="#4C2100"
                width={width}
                height={height}
            />
        </Group>
    );
}
