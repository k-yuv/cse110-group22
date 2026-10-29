import { Group, Rect, Text } from 'react-konva';

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
    return (
        <Group x={x} y={y}>
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
