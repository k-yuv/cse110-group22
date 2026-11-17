import { Circle, Group, Rect, Text } from 'react-konva';
import { FONT } from '../../../theme';
import { COLORS } from '../socialMediaContent';

export default function ThinkButton() {
    const bumps = [
        [48, 49, 28], [77, 38, 31], [113, 37, 33], [149, 40, 33],
        [187, 36, 32], [224, 42, 32], [259, 42, 34], [293, 55, 30],
        [315, 83, 30], [295, 124, 31], [264, 145, 29], [227, 144, 29],
        [186, 150, 30], [146, 148, 29], [105, 146, 29], [66, 137, 30],
        [35, 112, 30], [29, 81, 31],
    ] as const;

    return (
        <Group x={909} y={628} listening={false}>
            <Rect
                x={28}
                y={44}
                width={280}
                height={96}
                fill={COLORS.white}
                cornerRadius={38}
            />

            {bumps.map(([x, y, radius], i) => (
                <Circle
                    key={i}
                    x={x}
                    y={y}
                    radius={radius}
                    fill={COLORS.white}
                />
            ))}

            <Text
                x={48}
                y={79}
                width={252}
                align="center"
                text="Gather thoughts"
                fontFamily={FONT}
                fontStyle="bold"
                fontSize={24}
                fill={COLORS.brown}
            />
        </Group>
    );
}
