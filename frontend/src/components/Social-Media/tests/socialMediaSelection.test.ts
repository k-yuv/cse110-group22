import { describe, expect, it } from 'vitest';
import { getSocialPost, SOCIAL_LEVELS } from '../socialMediaContent.tsx';
import { makeThoughtSelection } from '../socialMediaSelection.ts';

const post = getSocialPost('catnip');

describe('social media selection rules', () => {
    it('builds stable selection metadata including correctness', () => {
        expect(makeThoughtSelection('catnip', post, 'catnip-no-sponsored')).toEqual({
            levelId: 'catnip',
            postId: post.id,
            thoughtId: 'catnip-no-sponsored',
            correct: true,
        });
        expect(makeThoughtSelection('catnip', post, 'catnip-yes-studies').correct).toBe(false);
    });

    it('rejects a thought from another post', () => {
        expect(() => makeThoughtSelection('catnip', post, 'cnn-no-owner')).toThrow(RangeError);
    });
});

describe('social media content', () => {
    it('has three posts, each with four thoughts and exactly one correct answer', () => {
        const posts = SOCIAL_LEVELS.catnip.posts;
        expect(posts).toHaveLength(3);
        for (const item of posts) {
            expect(item.thoughts).toHaveLength(4);
            expect(item.thoughts.filter((thought) => thought.correct)).toHaveLength(1);
            for (const thought of item.thoughts) {
                expect(thought.text).toMatch(/^(Yes|No)\. /);
                expect(thought.feedback.length).toBeGreaterThan(0);
            }
        }
    });
});
