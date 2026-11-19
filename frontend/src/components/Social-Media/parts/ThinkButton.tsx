
import { useEffect, useRef, useState} from 'react';
import Konva from 'konva';
import { Group, Path, Text } from 'react-konva';
import { COLORS as THEME_COLORS, FONT } from '../../../theme';
import { COLORS, LAYOUT } from '../socialMediaContent.tsx';

const CLOUD_PATH = [
    'M 35 30',
    'C 28 13 47 3 63 13',
    'C 75 -2 94 1 103 11',
    'C 116 -2 133 1 142 12',
    'C 158 1 174 8 181 19',
    'C 199 9 215 22 211 39',
    'C 230 45 229 64 214 75',
    'C 222 92 207 104 190 98',
    'C 177 112 159 110 146 101',
    'C 129 114 112 110 101 101',
    'C 85 114 68 109 59 99',
    'C 40 107 27 96 28 82',
    'C 9 81 3 63 18 50',
    'C 8 39 18 25 35 30 Z',
].join(' ');

const BASE_WIDTH = 230;
const BASE_HEIGHT = 110;

type CloudProps = {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    fontSize: number;
    onClick?: () => void;
    selected?: boolean;
    name?: string;
};

// Shared cloud renderer: selection controls persistent glow; hover adds temporary glow and scale.
function GlowCloud({
                       x,
                       y,
                       width,
                       height,
                       text,
                       fontSize,
                       onClick,
                       selected = false,
                       name,
                   }: CloudProps) {

    const groupRef = useRef<Konva.Group>(null);
    const hoverTweenRef = useRef<Konva.Tween | null>(null);
    const [hovered, setHovered] = useState(false);

    // A selected answer stays highlighted even after the pointer leaves.
    const glowing = selected || hovered;
    const shadowBlur = glowing
        ? Math.max(width, height) * 0.15
        : 0;

    const animateHover = (isHovered: boolean) => {
        setHovered(isHovered);

        const group = groupRef.current;
        if (!group) return;

        // Replace an in-flight tween so rapid mouse movements do not stack animations.
        hoverTweenRef.current?.destroy();

        hoverTweenRef.current = new Konva.Tween({
            node: group,
            duration: 0.15,
            scaleX: isHovered ? 1.06 : 1,
            scaleY: isHovered ? 1.06 : 1,
            easing: Konva.Easings.EaseInOut,
        });

        hoverTweenRef.current.play();
    };

    // Konva tweens are imperative objects and need cleanup when the cloud unmounts.
    useEffect(() => () => {
        hoverTweenRef.current?.destroy();
    }, []);

    // Center the group origin so hover scaling does not shift the cloud.
    return (
        <Group
            name={name}
            ref={groupRef}
            x={x + width / 2}
            y={y + height / 2}
            offsetX={width / 2}
            offsetY={height / 2}

            onMouseEnter={(event) => {
                animateHover(true);

                if (onClick) {
                    const stage = event.target.getStage();
                    if (stage) {
                        stage.container().style.cursor = 'pointer';
                    }
                }
            }}
            onMouseLeave={(event) => {
                animateHover(false);

                const stage = event.target.getStage();
                if (stage) {
                    stage.container().style.cursor = 'default';
                }
            }}
            onClick={onClick}
            onTap={onClick}
        >
            {/* Cloud shape  */}
            <Path
                data={CLOUD_PATH}
                scaleX={width / BASE_WIDTH}
                scaleY={height / BASE_HEIGHT}
                fill={COLORS.white}
                shadowColor={THEME_COLORS.hoverGlow}
                shadowBlur={shadowBlur}
                shadowOpacity={glowing ? 0.85 : 0}
                perfectDrawEnabled={false}
            />


            <Text
                x={width * 0.12}
                y={height * 0.30}
                width={width * 0.76}
                height={height * 0.50}
                text={text}
                fontFamily={FONT}
                fontStyle="bold"
                fontSize={fontSize}
                lineHeight={1.15}
                fill={COLORS.brown}
                align="center"
                verticalAlign="middle"
                listening={false}
            />
        </Group>
    );
}

export function ThoughtBubble({
                                  x,
                                  y,
                                  text, selected, onSelect, id,
                              }: {
    x: number;
    y: number;
    text: string;
    id: string;
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <GlowCloud
            x={x}
            y={y}
            width={230}
            height={110}
            text={text}
            fontSize={19}
            selected={selected}
            name={`thought-${id}`}
            onClick={onSelect}
        />
    );
}

export default function ThinkButton({
                                        open,
                                        onToggle,
                                    }: {
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <GlowCloud
            x={LAYOUT.thoughts.button.x}
            y={LAYOUT.thoughts.button.y}
            width={340}
            height={170}
            text={open ? 'Clear Mind' : 'Gather Thoughts'}
            fontSize={24}
            onClick={onToggle}
        />
    );
}
