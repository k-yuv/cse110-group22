import type { CSSProperties } from 'react';
import { Group, Layer, Rect, Stage } from 'react-konva';
import SettingsButton from '../SettingsButton/SettingsButton';
import HintButton from '../HintButton/HintButton';
import ProgressBar from '../Progress-Bar/ProgressBar';
import Journal from '../Journal/journalView';
import { visuallyHidden } from '../../helpers';
import {
    BACK_BUTTON_SIZE, COLORS, DEFAULT_LEVEL, DONE_LABEL, HINT_TEXT, LAYOUT, NEXT_LABEL,
    PAGE_TITLE, PROGRESS_LABEL, SCENE,
    type SocialLevelId,
} from './socialMediaContent.tsx';
import type { SocialThoughtSelection } from './socialMediaSelection.ts';
import { useSocialMediaModel } from './socialMediaModel.tsx';
import SocialMediaLaptop from './parts/SocialMediaLaptop.tsx';
import ThinkButton, { FeedbackBubble, ThoughtBubble } from './parts/ThinkButton.tsx';
import BackButton from '../Back-Button/backButtonView';
import BackConfirmation from '../Back-Confirmation/backConfirmationView';

const THOUGHT_STAGGER = 0.12;

const progressStyle: CSSProperties = {
    position: 'absolute',
    zIndex: 1,
    right: 24,
    top: 16,
};

interface Props {
    levelId?: SocialLevelId;
    onSelectionChange?: (selection: SocialThoughtSelection) => void;
}

export default function SocialMedia({ levelId = DEFAULT_LEVEL, onSelectionChange }: Props) {
    const {
        width, height, scale, originX, originY, sizeUnit,
        post, selection, selectThought, feedback, wrongCount,
        completedPosts, totalPosts, canAdvance, isDone, onAdvance, error,
        onBackToDesk, backConfirmation,
    } = useSocialMediaModel(levelId, onSelectionChange);

    const sceneTransform = {
        x: originX, y: originY, scaleX: scale, scaleY: scale,
    };
    const advanceLabel = isDone ? DONE_LABEL : NEXT_LABEL;
    const solvedId = selection?.correct ? selection.thoughtId : undefined;

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
                    </Group>
                </Layer>
                <Layer>
                    <Group {...sceneTransform}>
                        {post.thoughts.map((thought, index) => (
                            <ThoughtBubble
                                key={thought.id}
                                id={thought.id}
                                {...LAYOUT.thoughts.slots[index]}
                                text={thought.text}
                                correct={solvedId === thought.id}
                                shakeKey={wrongCount}
                                fadeInDelay={index * THOUGHT_STAGGER}
                                onSelect={() => selectThought(thought.id)}
                            />
                        ))}
                        {feedback && (
                            <FeedbackBubble key={feedback.key} text={feedback.text} correct={feedback.correct} />
                        )}
                        <ThinkButton label={advanceLabel} enabled={canAdvance} onClick={onAdvance} />
                    </Group>
                </Layer>
            </Stage>

            {/* Offscreen native controls expose the Konva-only actions to keyboard and screen-reader users. */}
            <div style={visuallyHidden}>
                <fieldset>
                    <legend>Is this post reliable?</legend>
                    {post.thoughts.map((thought) => (
                        <button key={thought.id} type="button" onClick={() => selectThought(thought.id)}
                                aria-pressed={selection?.thoughtId === thought.id}>
                            {thought.text}
                        </button>
                    ))}
                </fieldset>
                {feedback && <p role="status">{feedback.text}</p>}
                <button type="button" onClick={onAdvance} disabled={!canAdvance}>
                    {advanceLabel}
                </button>
            </div>

            {/* Same corner journal as Interview: click it to review evidence collected so far. */}
            <Journal placement="corner" />
            <ProgressBar completed={completedPosts} total={totalPosts} label={PROGRESS_LABEL} style={progressStyle} />
            <SettingsButton />
            <HintButton hint={HINT_TEXT} />
            <BackButton
                onClick={onBackToDesk}
                size={BACK_BUTTON_SIZE * sizeUnit}
                style={{ left: 22, top: 162 }}
            />

            {error && (
                <p role="alert" style={{ position: 'absolute', right: 24, bottom: 24, zIndex: 10 }}>
                    {error}
                </p>
            )}

            <BackConfirmation activityName={PAGE_TITLE} {...backConfirmation} />
        </main>
    );
}
