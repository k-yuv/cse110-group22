import { Group, Layer, Rect, Stage } from 'react-konva';
import SettingsButton from '../SettingsButton/SettingsButton';
import { URLImage } from '../URLImage/URLImage';
import journalImage from '../../assets/Journal-Corner-View.png';
import {
    COLORS, DEFAULT_LEVEL, LAYOUT, SCENE,
    type SocialLevelId,
} from './socialMediaContent.tsx';
import type { SocialThoughtSelection } from './socialMediaSelection.ts';
import { useSocialMediaModel } from './socialMediaModel.tsx';
import SocialMediaLaptop from './parts/SocialMediaLaptop.tsx';
import ThinkButton, { ThoughtBubble } from './parts/ThinkButton.tsx';
import BackButton from '../Back-Button/backButtonView';
import BackConfirmation from '../Back-Confirmation/backConfirmationView';
import {BACK_BUTTON_SIZE, FINISH_LABEL, PAGE_TITLE} from "./socialMediaContent.tsx";

interface Props {
    levelId?: SocialLevelId;
    postIndex?: number;
    onSelectionChange?: (selection: SocialThoughtSelection | null) => void;
}

export default function SocialMedia({ levelId = DEFAULT_LEVEL, postIndex = 0, onSelectionChange }: Props) {
    const {
        width, height, scale, originX, originY, sizeUnit,
        post, thoughtsOpen, toggleThoughts, selection, selectThought, onBackToDesk, backConfirmation,
        canFinish, finishing, error, onFinish,
    } = useSocialMediaModel(levelId, postIndex, onSelectionChange);

    const sceneTransform = {
        x: originX, y: originY, scaleX: scale, scaleY: scale,
    };

    return (
        <main aria-label="Social media chapter"
              style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: COLORS.wall }}>
            <Stage width={width} height={height}>
                {/* The scenery should not intercept clicks intended for the thought bubbles. */}
                <Layer listening={false}>
                    <Rect width={width} height={height} fill={COLORS.wall} />
                    <Group {...sceneTransform}>
                        <Rect x={-SCENE.width} y={LAYOUT.deskTop}
                              width={SCENE.width * 3} height={SCENE.height}
                              fill={COLORS.desktop} />
                        <Group x={LAYOUT.laptopOffset.x} y={LAYOUT.laptopOffset.y}>
                            <SocialMediaLaptop post={post} />
                        </Group>
                        <URLImage src={journalImage} {...LAYOUT.journal} />
                    </Group>
                </Layer>
                <Layer>
                    <Group {...sceneTransform}>
                        {thoughtsOpen && (
                            <>
                                {post.thoughts.map((thought, index) => {
                                    // Two positions are defined per stance; map indices 0-1 and 2-3 to those slots.
                                    const sideIndex = index < 2 ? index : index - 2;
                                    const position = LAYOUT.thoughts[thought.stance][sideIndex];
                                    return position && (
                                        <ThoughtBubble
                                            key={thought.id}
                                            id={thought.id}
                                            {...position}
                                            text={thought.text}
                                            selected={selection?.thoughtId === thought.id}
                                            onSelect={() => selectThought(thought.id)}
                                        />
                                    );
                                })}
                            </>
                        )}
                        <ThinkButton
                            open={thoughtsOpen} onToggle={toggleThoughts} />
                    </Group>
                </Layer>
            </Stage>

            {/* An offscreen native button exposes the Konva-only action to keyboard users. */}
            <button type="button" onClick={toggleThoughts}
                    aria-pressed={thoughtsOpen}
                    style={{ position: 'absolute', left: -10000, top: 0 }}>
                {thoughtsOpen ? 'Clear thoughts' : 'Gather thoughts'}
            </button>

            {/* TEMPORARY NAVBAR*/}
            {/* TODO FIX IT GLOBALLY */}

            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 10,
                }}
            >
                {/* Settings */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                    }}
                >
                    <SettingsButton />
                </div>

                {/* Back */}
                <div
                    style={{
                        position: 'absolute',
                        top: 90,
                        left: 0,
                    }}
                >
                    <BackButton
                        onClick={onBackToDesk}
                        size={BACK_BUTTON_SIZE * sizeUnit}
                    />
                </div>
            </div>

            {/* Shown once a thought is picked: marks Social Media done and returns to the desk. */}
            {(canFinish || error) && (
                <div style={{ position: 'absolute', right: 24, bottom: 24, zIndex: 10, textAlign: 'right' }}>
                    {error && <p role="alert">{error}</p>}
                    {canFinish && (
                        <button type="button" onClick={onFinish} disabled={finishing}>
                            {FINISH_LABEL}
                        </button>
                    )}
                </div>
            )}

            <BackConfirmation activityName={PAGE_TITLE} {...backConfirmation} />
        </main>
    );
}
