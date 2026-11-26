import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { completeActivity } from '../../services/progress';
import {
    getSocialLevel, getSocialPost, LAYOUT, SAVE_ERROR, SCENE,
    type SocialLevelId,
} from './socialMediaContent.tsx';
import {
    makeThoughtSelection, toggleThoughtSelection,
    type SocialThoughtSelection,
} from './socialMediaSelection.ts';
import {useBackConfirmationModel} from "../Back-Confirmation/backConfirmationModel.tsx";
import {ROUTES} from "../../routes.ts";
import { addEvidence } from '../NewsArticle/journalAdapter';

const MAX_WIDTH_TO_HEIGHT = 1.5;

// Fall back to the design canvas size when window is unavailable.
function viewport() {
    if (typeof window === 'undefined') return { width: SCENE.width, height: SCENE.height };
    return { width: window.innerWidth, height: window.innerHeight };
}

// Owns chapter state and converts fixed scene coordinates into viewport-relative positions.
export function useSocialMediaModel(
    levelId: SocialLevelId,
    postIndex = 0,
    onSelectionChange?: (selection: SocialThoughtSelection | null) => void,
) {
    const [size, setSize] = useState(viewport);
    const [thoughtsOpen, setThoughtsOpen] = useState(false);
    const [savedSelection, setSavedSelection] = useState<SocialThoughtSelection | null>(null);
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
    // Never display a choice belonging to a previous post during a prop change.
    const selection = savedSelection?.levelId === levelId && savedSelection.postId === post.id
        ? savedSelection : null;

    // A new post begins with no open bubbles or selected answer.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setThoughtsOpen(false);
        setSavedSelection(null);
    }, [levelId, postIndex]);

    // Fit the entire design canvas without cropping, then center it in the viewport.
    const scale = Math.min(size.width / SCENE.width, size.height / SCENE.height);
    const originX = (size.width - SCENE.width * scale) / 2;
    const originY = (size.height - SCENE.height * scale) / 2 + LAYOUT.verticalOffset * scale;

    const sizeUnit = Math.min(size.width, size.height * MAX_WIDTH_TO_HEIGHT);

    // Selecting the active answer clears it; selecting another replaces it and notifies the parent.
    function selectThought(thoughtId: string) {
        const next = toggleThoughtSelection(selection, makeThoughtSelection(levelId, post, thoughtId));
        setSavedSelection(next);
        onSelectionChange?.(next);
    }

    // Clear Mind is a visibility control, not a request to deselect the answer.
    function toggleThoughts() {
        setThoughtsOpen(previous => !previous);
    }

    // Picking any thought is enough to finish for now; grading the pick will come from the backend.
    // The post's evidence goes in the journal first; if it can't be saved, the player stays here.
    async function finish() {
        if (!selection || finishing) return;
        setError('');
        setFinishing(true);

        try {
            const saved = await Promise.all(post.evidenceIds.map((id) => addEvidence(id)));
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

    const { onBack, confirmation } = useBackConfirmationModel({
        onLeave: () => navigate(ROUTES.desk),
    });

    return {
        ...size, scale, originX, originY, level, post, sizeUnit,
        thoughtsOpen, selection, selectThought, toggleThoughts, onBackToDesk: onBack, backConfirmation: confirmation,
        canFinish: selection !== null, finishing, error, onFinish: finish,
    };
}
