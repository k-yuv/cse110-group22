import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { completeActivity } from '../../services/progress';
import {
    getSocialLevel, getSocialPost, LAYOUT, SAVE_ERROR, SCENE,
    type SocialLevelId,
} from './socialMediaContent.tsx';
import { makeThoughtSelection, type SocialThoughtSelection } from './socialMediaSelection.ts';
import { useBackConfirmationModel } from '../Back-Confirmation/backConfirmationModel.tsx';
import { ROUTES } from '../../routes.ts';
import { addEvidence } from '../NewsArticle/journalAdapter';

const MAX_WIDTH_TO_HEIGHT = 1.5;

export interface SocialFeedback {
    // Changes on every pick so the view replays the bubble even for the same thought.
    key: number;
    text: string;
    correct: boolean;
}

// Fall back to the design canvas size when window is unavailable.
function viewport() {
    if (typeof window === 'undefined') return { width: SCENE.width, height: SCENE.height };
    return { width: window.innerWidth, height: window.innerHeight };
}

// Owns chapter state and converts fixed scene coordinates into viewport-relative positions.
// The player reviews each post in turn: a wrong pick shakes the thoughts, the right pick
// unlocks Next, and Done on the last post saves every post's evidence and returns to the desk.
export function useSocialMediaModel(
    levelId: SocialLevelId,
    onSelectionChange?: (selection: SocialThoughtSelection) => void,
) {
    const [size, setSize] = useState(viewport);
    const [postIndex, setPostIndex] = useState(0);
    const [selection, setSelection] = useState<SocialThoughtSelection | null>(null);
    const [feedback, setFeedback] = useState<SocialFeedback | null>(null);
    const [wrongCount, setWrongCount] = useState(0);
    const [finishing, setFinishing] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const onResize = () => setSize(viewport());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const level = getSocialLevel(levelId);
    const post = getSocialPost(levelId, postIndex);
    const totalPosts = level.posts.length;
    const solved = selection?.postId === post.id && selection.correct;
    const isLastPost = postIndex === totalPosts - 1;
    const completedPosts = postIndex + (solved ? 1 : 0);

    const scale = Math.min(size.width / SCENE.width, size.height / SCENE.height);
    const originX = (size.width - SCENE.width * scale) / 2;
    const originY = (size.height - SCENE.height * scale) / 2 + LAYOUT.verticalOffset * scale;

    const sizeUnit = Math.min(size.width, size.height * MAX_WIDTH_TO_HEIGHT);

    // Once the right thought is found the post is locked until the player moves on
    function selectThought(thoughtId: string) {
        if (solved) return;
        const next = makeThoughtSelection(levelId, post, thoughtId);
        const thought = post.thoughts.find((item) => item.id === thoughtId)!;
        setSelection(next);
        setFeedback((previous) => ({
            key: (previous?.key ?? 0) + 1,
            text: thought.feedback,
            correct: thought.correct,
        }));
        if (!next.correct) setWrongCount((count) => count + 1);
        onSelectionChange?.(next);
    }

    // Saves every reviewed post's evidence
    async function finish() {
        if (finishing) return;
        setError('');
        setFinishing(true);

        try {
            const ids = level.posts.flatMap((item) => item.evidenceIds);
            const saved = await Promise.all(ids.map((id) => addEvidence(id)));
            if (saved.includes(false)) {
                setError(SAVE_ERROR);
                return;
            }
            await completeActivity('social');
            navigate(ROUTES.desk);
        } catch {
            setError(SAVE_ERROR);
        } finally {
            setFinishing(false);
        }
    }

    // Next only works after the right answer; on the last post it becomes Done
    function advance() {
        if (!solved) return;
        if (isLastPost) {
            void finish();
            return;
        }
        setPostIndex((index) => index + 1);
        setSelection(null);
        setFeedback(null);

        // Wrong effect
        setWrongCount(0);
    }

    const { onBack, confirmation } = useBackConfirmationModel({
        onLeave: () => navigate(ROUTES.desk),
    });

    return {
        ...size, scale, originX, originY, level, post, postIndex, sizeUnit,
        selection, selectThought, feedback, wrongCount,
        completedPosts, totalPosts, canAdvance: solved && !finishing, isDone: solved && isLastPost,
        onAdvance: advance, finishing, error,
        onBackToDesk: onBack, backConfirmation: confirmation,
    };
}
