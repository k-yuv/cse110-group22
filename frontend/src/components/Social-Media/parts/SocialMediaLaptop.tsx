
import { Group, Line, Rect, Text } from 'react-konva';
import { FONT } from '../../../theme';
import {
    COLORS,
    LAYOUT,
    NAV_ITEMS,
    type SocialPost,
} from '../socialMediaContent.tsx';
import SocialMediaPost from './SocialMediaPost.tsx';

interface Props {
    post: SocialPost;
}

// Draws the laptop shell and navigation; delegates the changing post to SocialMediaPost.
export default function SocialMediaLaptop({ post }: Props) {
    const {
        frame,
        screen,
        base,
        brand,
        nav,
    } = LAYOUT.laptop;

    return (
        <Group>
            {/* Laptop base */}
            <Line
                points={[...base]}
                closed
                fill={COLORS.laptop}
                lineJoin="round"
            />

            {/* Laptop outer frame */}
            <Rect
                x={frame.x}
                y={frame.y}
                width={frame.width}
                height={frame.height}
                cornerRadius={frame.radius}
                fill={COLORS.laptop}
            />

            {/* Screen */}
            <Rect
                x={screen.x}
                y={screen.y}
                width={screen.width}
                height={screen.height}
                cornerRadius={screen.radius}
                fill={COLORS.screen}
            />

            {/* Social platform name */}
            <Text
                x={brand.x}
                y={brand.y}
                text={post.app}
                fontFamily={FONT}
                fontStyle="bold"
                fontSize={16}
                fill={COLORS.gold}
            />

            {/* Navigation */}
            {NAV_ITEMS.map((label, index) => (
                <Text
                    key={label}
                    x={nav.x}
                    y={nav.startY + index * nav.stepY}
                    text={label}
                    fontFamily={FONT}
                    fontStyle="bold"
                    fontSize={10.5}
                    fill={COLORS.gold}
                />
            ))}

            {/* Level-dependent content */}
            <SocialMediaPost post={post} />
        </Group>
    );
}
