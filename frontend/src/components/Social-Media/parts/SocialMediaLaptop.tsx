import { Group, Line, Rect, Text } from 'react-konva';
import { FONT } from '../../../theme';
import { COLORS, NAV_ITEMS, POST } from '../socialMediaContent';

export default function SocialMediaLaptop() {
    const transcriptY = [348, 406, 459, 505];

    // Laptop dimensions
    const bezel = 46;
    const bottomBezel = 64;
    const screenHeight = 369;

    const laptop = {
        x: 316,
        y: 184.5,
        width: 639,
        height: bezel + screenHeight + bottomBezel,
    };

    const screen = {
        x: laptop.x + bezel,
        y: laptop.y + bezel,
        width: laptop.width - bezel * 2,
        height: screenHeight,
    };

    const contentOffsetY = 0;

    return (
        <Group>
            {/* Laptop base / keyboard-free trapezoid */}
            <Line
                points={[
                    340, 647,
                    929, 647,
                    1080, 854,
                    222, 854,
                ]}
                closed
                fill={COLORS.laptop}
                lineJoin="round"
            />

            {/* Black laptop outer frame */}
            <Rect
                x={laptop.x}
                y={laptop.y}
                width={laptop.width}
                height={laptop.height}
                cornerRadius={80}
                fill={COLORS.laptop}
            />

            {/* Laptop display */}
            <Rect
                x={screen.x}
                y={screen.y}
                width={screen.width}
                height={screen.height}
                cornerRadius={27}
                fill={COLORS.screen}
            />

            {/* All screen content moves together */}
            <Group y={contentOffsetY}>
                {/* Kitstagram heading */}
                <Text
                    x={386}
                    y={274}
                    text={POST.app}
                    fontFamily={FONT}
                    fontStyle="bold"
                    fontSize={16}
                    fill={COLORS.gold}
                />

                {/* Navigation */}
                {NAV_ITEMS.map((item) => (
                    <Group key={item.text}>
                        <Text
                            x={385}
                            y={item.y - 11}
                            width={27}
                            align="center"
                            fontFamily={FONT}
                            fontSize={24}
                            fontStyle="bold"
                            fill={COLORS.gold}
                        />
                        <Text
                            x={419}
                            y={item.y + 1}
                            text={item.text}
                            fontFamily={FONT}
                            fontStyle="bold"
                            fontSize={10.5}
                            fill={COLORS.gold}
                        />
                    </Group>
                ))}

                {/* Video placeholder */}
                <Rect
                    x={532}
                    y={274}
                    width={281}
                    height={276}
                    fill={COLORS.video}
                    stroke={COLORS.brown}
                    strokeWidth={1}
                />

                <Text
                    x={550}
                    y={308}
                    text={POST.heading}
                    width={248}
                    fontFamily={FONT}
                    fontStyle="bold"
                    fontSize={21}
                    fill={COLORS.white}
                />

                {/* Video transcript */}
                {POST.transcript.map((paragraph, i) => (
                    <Text
                        key={i}
                        x={549}
                        y={transcriptY[i]}
                        width={248}
                        text={paragraph}
                        fontFamily={FONT}
                        fontSize={10.5}
                        lineHeight={1.14}
                        fill={COLORS.white}
                    />
                ))}

                {/* Post footer */}
                <Rect
                    x={532}
                    y={550}
                    width={281}
                    height={49}
                    fill={COLORS.postFooter}
                    stroke={COLORS.brown}
                    strokeWidth={1}
                />

                <Text
                    x={541}
                    y={558}
                    width={265}
                    text={POST.author}
                    fontFamily={FONT}
                    fontSize={12}
                    fontStyle="bold"
                    fill={COLORS.brown}
                />

                <Text
                    x={541}
                    y={575}
                    width={265}
                    text={POST.preview}
                    fontFamily={FONT}
                    fontSize={12}
                    ellipsis
                    fill={COLORS.brown}
                />
            </Group>
        </Group>
    );
}
