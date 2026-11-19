import type { SocialLevelId, SocialPost, ThoughtOption } from './socialMediaContent.tsx';

/* Interface for answer data to be connected for MCQ from backend */
export interface SocialThoughtSelection {
    levelId: SocialLevelId;
    postId: string;
    thoughtId: string;
    stance: ThoughtOption['stance'];
}

// Validate the clicked thought against the current post before storing its identity and stance.
export function makeThoughtSelection(
    levelId: SocialLevelId,
    post: SocialPost,
    thoughtId: string,
): SocialThoughtSelection {
    const thought = post.thoughts.find((item) => item.id === thoughtId);
    if (!thought) throw new RangeError(`Unknown thought ${thoughtId} for post ${post.id}`);
    return { levelId, postId: post.id, thoughtId: thought.id, stance: thought.stance };
}

// Only a second click on the same thought in the same post deselects it.
export function toggleThoughtSelection(
    selected: SocialThoughtSelection | null,
    next: SocialThoughtSelection,
): SocialThoughtSelection | null {
    return selected?.levelId === next.levelId &&
    selected.postId === next.postId &&
    selected.thoughtId === next.thoughtId
        ? null
        : next;
}
