
import { Group, Rect, Text } from 'react-konva';
import { FONT } from '../../../theme';
import {
    COLORS,
    LAYOUT,
    type SocialPost,
} from '../socialMediaContent.tsx';

interface Props {
    post: SocialPost;
}

// Renders the post inside the laptop using local coordinates from LAYOUT.post.
export default function SocialMediaPost({ post }: Props) {
    const p = LAYOUT.post;

    const textX = p.paddingX;
    const textWidth = p.width - 2 * p.paddingX;
    const transcriptY = p.transcriptTop;
    // Reserve the space below the heading and above the video edge for transcript text.
    const transcriptHeight =
        p.videoHeight - transcriptY - p.transcriptBottom;

    return (
        <Group x={p.x} y={p.y}>
            {/* Video background */}
            <Rect
                width={p.width}
                height={p.videoHeight}
                fill={COLORS.video}
                stroke={COLORS.brown}
                strokeWidth={1}
            />

            {/* Video heading */}
            <Text
                x={textX}
                y={p.headingTop}
                width={textWidth}
                height={43}
                text={post.heading}
                fontFamily={FONT}
                fontStyle="bold"
                fontSize={21}
                fill={COLORS.white}
                wrap="word"
                ellipsis
            />

            {/* Dynamic transcript */}
            <Text
                x={textX}
                y={transcriptY}
                width={textWidth}
                height={transcriptHeight}
                text={post.transcript.join('\n\n')}
                fontFamily={FONT}
                fontSize={10.5}
                lineHeight={1.14}
                fill={COLORS.white}
                wrap="word"
                ellipsis
            />

            {/* Post footer */}
            <Rect
                y={p.videoHeight}
                width={p.width}
                height={p.footerHeight}
                fill={COLORS.postFooter}
                stroke={COLORS.brown}
                strokeWidth={1}
            />

            <Text
                x={9}
                y={p.videoHeight + 8}
                width={p.width - 18}
                text={post.author}
                fontFamily={FONT}
                fontSize={12}
                fontStyle="bold"
                fill={COLORS.brown}
                ellipsis
            />

            <Text
                x={9}
                y={p.videoHeight + 25}
                width={p.width - 18}
                text={post.preview}
                fontFamily={FONT}
                fontSize={12}
                fill={COLORS.brown}
                ellipsis
                wrap="none"
            />
        </Group>
    );
}
