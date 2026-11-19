import { describe, expect, it } from 'vitest';
import { getSocialPost } from '../socialMediaContent.tsx';
import { makeThoughtSelection, toggleThoughtSelection } from '../socialMediaSelection.ts';

const post = getSocialPost('catnip');

describe('social media selection rules', () => {
    it('builds stable selection metadata without deciding correctness', () => {
        expect(makeThoughtSelection('catnip', post, 'catnip-question-1')).toEqual({
            levelId: 'catnip',
            postId: post.id,
            thoughtId: 'catnip-question-1',
            stance: 'questioning',
        });
    });

    it('selects one thought, replaces it with another, and toggles it off', () => {
        const first = makeThoughtSelection('catnip', post, 'catnip-support-1');
        const second = makeThoughtSelection('catnip', post, 'catnip-question-2');

        expect(toggleThoughtSelection(null, first)).toEqual(first);
        expect(toggleThoughtSelection(first, second)).toEqual(second);
        expect(toggleThoughtSelection(second, second)).toBeNull();
    });
});
