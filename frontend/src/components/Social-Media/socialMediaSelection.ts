import type { SocialLevelId, SocialPost } from './socialMediaContent.tsx';

/* Interface for answer data to be connected for MCQ from backend */
export interface SocialThoughtSelection {
    levelId: SocialLevelId;
    postId: string;
    thoughtId: string;
    correct: boolean;
}

// TODO: Move to backend service and load data and content asynchronously
// Answer check
export function makeThoughtSelection(
    levelId: SocialLevelId,
    post: SocialPost,
    thoughtId: string,
): SocialThoughtSelection {
    const thought = post.thoughts.find((item) => item.id === thoughtId);
    if (!thought) throw new RangeError(`Unknown thought ${thoughtId} for post ${post.id}`);
    return { levelId, postId: post.id, thoughtId: thought.id, correct: thought.correct };
}
