import { Group, Layer, Rect, Stage } from 'react-konva';
import SettingsButton from '../SettingsButton/SettingsButton';
import { URLImage } from '../URLImage/URLImage';
import journalImage from '../../assets/Journal-Corner-View.png';
import { COLORS, POST, SCENE } from './socialMediaContent';
import { useSocialMediaModel } from './socialMediaModel';
import SocialLaptop from './parts/SocialMediaLaptop';

export default function SocialMedia() {
    const { width, height, scale, originX, originY } = useSocialMediaModel();

    return (
        <main
            aria-label="Social media chapter"
            style={{
                position: 'fixed',
                inset: 0,
                overflow: 'hidden',
                background: COLORS.wall
            }}
        >
            <Stage width={width} height={height}>
                <Layer listening={false}>
                    <Rect
                        width={width}
                        height={height}
                        fill={COLORS.wall}
                    />

                    <Group
                        x={originX}
                        y={originY}
                        scaleX={scale}
                        scaleY={scale}
                    >
                        {/* Entire desk surface runs off both sides of the artboard. */}
                        <Rect
                            x={-SCENE.width}
                            y={561}
                            width={SCENE.width * 3}
                            height={SCENE.height}
                            fill={COLORS.desktop}
                        />

                        <Group x={5} y={-25}>
                            <SocialLaptop />
                        </Group>

                        {/* The journal and its sticky note */}
                        <URLImage
                            src={journalImage}
                            x={-156}
                            y={615}
                            width={503}
                            height={402}
                        />
                    </Group>
                </Layer>
            </Stage>

            <SettingsButton/>

            <p
                style={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    overflow: 'hidden',
                    clip: 'rect(0 0 0 0)',
                    whiteSpace: 'nowrap'
                }}
            >
                Example {POST.app} post by {POST.author}. {POST.transcript.join(' ')}
            </p>
        </main>
    );
}
