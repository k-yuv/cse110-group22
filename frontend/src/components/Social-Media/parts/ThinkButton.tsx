import { useEffect, useRef, useState } from 'react';
import Konva from 'konva';
import { Circle, Group, Path, Text } from 'react-konva';
import { FONT } from '../../../theme';
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

const FADE_IN_SECONDS = 0.6;
const SHAKE_MS = 450;
const SHAKE_AMPLITUDE = 9;

const WRONG_GLOW_MS = 700;

type CloudProps = {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    fontSize: number;
    onClick?: () => void;
    correct?: boolean;
    disabled?: boolean;
    shakeKey?: number;
    fadeInDelay?: number;
    name?: string;
};

function GlowCloud({
    x, y, width, height, text, fontSize, onClick,
    correct = false, disabled = false, shakeKey = 0, fadeInDelay = 0, name,
}: CloudProps) {
    const groupRef = useRef<Konva.Group>(null);
    const hoverTweenRef = useRef<Konva.Tween | null>(null);
    const [hovered, setHovered] = useState(false);
    const [flashingWrong, setFlashingWrong] = useState(false);
    const interactive = Boolean(onClick) && !disabled;

    let glowColor: string = COLORS.hoverGlow;
    if (flashingWrong) glowColor = COLORS.wrongGlow;
    else if (correct) glowColor = COLORS.correctGlow;
    const glowing = flashingWrong || correct || (hovered && interactive);
    const shadowBlur = glowing ? Math.max(width, height) * 0.15 : 0;

    const animateHover = (isHovered: boolean) => {
        setHovered(isHovered);

        const group = groupRef.current;
        if (!group) return;

        // Replace an in-flight tween so rapid mouse movements do not stack animations.
        hoverTweenRef.current?.destroy();
        const grow = isHovered && interactive;
        hoverTweenRef.current = new Konva.Tween({
            node: group,
            duration: 0.15,
            scaleX: grow ? 1.06 : 1,
            scaleY: grow ? 1.06 : 1,
            easing: Konva.Easings.EaseInOut,
        });
        hoverTweenRef.current.play();
    };

    // Fade in when the cloud first appears.
    useEffect(() => {
        const group = groupRef.current;
        if (!group) return;
        group.opacity(0);
        const tween = new Konva.Tween({
            node: group,
            duration: FADE_IN_SECONDS,
            opacity: 1,
            easing: Konva.Easings.EaseInOut,
        });
        const timer = setTimeout(() => tween.play(), fadeInDelay * 1000);
        return () => {
            clearTimeout(timer);
            tween.destroy();
        };
    }, [fadeInDelay]);

    // Wrong effect
    useEffect(() => {
        if (shakeKey === 0) return;
        const group = groupRef.current;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFlashingWrong(true);
        const glowTimer = setTimeout(() => setFlashingWrong(false), WRONG_GLOW_MS);

        const layer = group?.getLayer();
        const animation = group && layer ? new Konva.Animation((frame) => {
            const elapsed = frame?.time ?? 0;
            if (elapsed >= SHAKE_MS) {
                group.offsetX(width / 2);
                animation?.stop();
                return;
            }
            const decay = 1 - elapsed / SHAKE_MS;
            group.offsetX(width / 2 + Math.sin(elapsed / 25) * SHAKE_AMPLITUDE * decay);
        }, layer) : null;
        animation?.start();

        return () => {
            clearTimeout(glowTimer);
            animation?.stop();
            group?.offsetX(width / 2);
        };
    }, [shakeKey, width]);

    // Clean up cloud effects when new next question starts.
    useEffect(() => () => {
        hoverTweenRef.current?.destroy();
    }, []);

    const setCursor = (event: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
        const stage = event.target.getStage();
        if (stage) stage.container().style.cursor = cursor;
    };

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
                if (interactive) setCursor(event, 'pointer');
            }}
            onMouseLeave={(event) => {
                animateHover(false);
                setCursor(event, 'default');
            }}
            onClick={interactive ? onClick : undefined}
            onTap={interactive ? onClick : undefined}
        >
            <Group opacity={disabled ? 0.5 : 1}>
                <Path
                    data={CLOUD_PATH}
                    scaleX={width / BASE_WIDTH}
                    scaleY={height / BASE_HEIGHT}
                    fill={correct ? COLORS.correctFill : COLORS.white}
                    shadowColor={glowColor}
                    shadowBlur={shadowBlur}
                    shadowOpacity={glowing ? 0.9 : 0}
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
                    wrap="word"
                    listening={false}
                />
            </Group>
        </Group>
    );
}

export function ThoughtBubble({
    x, y, text, id, correct, shakeKey, fadeInDelay, onSelect,
}: {
    x: number;
    y: number;
    text: string;
    id: string;
    correct: boolean;
    shakeKey: number;
    fadeInDelay?: number;
    onSelect: () => void;
}) {
    const { width, height, fontSize } = LAYOUT.thoughts.bubble;
    return (
        <GlowCloud
            x={x}
            y={y}
            width={width}
            height={height}
            text={text}
            fontSize={fontSize}
            correct={correct}
            shakeKey={shakeKey}
            fadeInDelay={fadeInDelay}
            name={`thought-${id}`}
            onClick={onSelect}
        />
    );
}

const FEEDBACK_IN_SECONDS = 0.25;
const FEEDBACK_HOLD_MS = 3200;
const FEEDBACK_OUT_SECONDS = 0.6;

export function FeedbackBubble({ text, correct }: { text: string; correct: boolean }) {
    const groupRef = useRef<Konva.Group>(null);
    const { x, y, width, height, fontSize } = LAYOUT.feedback;
    const glow = correct ? COLORS.correctGlow : COLORS.wrongGlow;

    useEffect(() => {
        const group = groupRef.current;
        if (!group) return;
        group.opacity(0);
        // Offset to stop Konva from skipping feedback and flashing effects on initial render
        let tween = new Konva.Tween({ node: group, duration: FEEDBACK_IN_SECONDS, opacity: 1 });
        tween.play();
        const timer = setTimeout(() => {
            tween.destroy();
            tween = new Konva.Tween({ node: group, duration: FEEDBACK_OUT_SECONDS, opacity: 0 });
            tween.play();
        }, FEEDBACK_HOLD_MS);
        return () => {
            clearTimeout(timer);
            tween.destroy();
        };
    }, []);

    return (
        <Group ref={groupRef} name="feedback" listening={false}>
            <Circle x={x + width + 12} y={y + height - 11} radius={8}
                    fill={COLORS.white} shadowColor={glow} shadowBlur={10} shadowOpacity={0.8} />
            <Circle x={x + width + 32} y={y + height + 9} radius={5}
                    fill={COLORS.white} shadowColor={glow} shadowBlur={8} shadowOpacity={0.8} />
            <Path
                x={x}
                y={y}
                data={CLOUD_PATH}
                scaleX={width / BASE_WIDTH}
                scaleY={height / BASE_HEIGHT}
                fill={COLORS.white}
                shadowColor={glow}
                shadowBlur={18}
                shadowOpacity={0.9}
                perfectDrawEnabled={false}
            />
            <Text
                x={x + width * 0.12}
                y={y + height * 0.27}
                width={width * 0.76}
                height={height * 0.54}
                text={text}
                fontFamily={FONT}
                fontStyle="bold"
                fontSize={fontSize}
                lineHeight={1.15}
                fill={COLORS.brown}
                align="center"
                verticalAlign="middle"
                wrap="word"
            />
        </Group>
    );
}

export default function ThinkButton({
    label, enabled, onClick,
}: {
    label: string;
    enabled: boolean;
    onClick: () => void;
}) {
    return (
        <GlowCloud
            x={LAYOUT.thoughts.button.x}
            y={LAYOUT.thoughts.button.y}
            width={340}
            height={170}
            text={label}
            fontSize={30}
            disabled={!enabled}
            name="next-button"
            onClick={onClick}
        />
    );
}
