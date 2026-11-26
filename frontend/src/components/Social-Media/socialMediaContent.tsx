export const PAGE_TITLE = 'Social Media';
export const FINISH_LABEL = 'Finish';
export const HINT_TEXT =
  'Investigate the social media post for suspicious information. Gather your thoughts and consider whether ' +
  'the post seems credible.';
export const SAVE_ERROR = 'Could not save social media progress';

export const SCENE = { width: 1280, height: 854 } as const;

export const COLORS = {
    wall: '#fff6df',
    desktop: '#86624f',
    deskEdge: '#553a16',
    paper: '#f5fcfc',
    laptop: '#242424',
    screen: '#f7fcfd',
    brown: '#4c2100',
    gold: '#664800',
    video: '#b59663',
    postFooter: '#fff2df',
    white: '#ffffff',
} as const;

export const LAYOUT = {
    verticalOffset: -55,
    deskTop: 561,
    laptopOffset: { x: 5, y: -25 },
    journal: { x: -156, y: 615, width: 503, height: 402 },
    laptop: {
        frame: { x: 316, y: 184.5, width: 639, height: 479, radius: 80 },
        screen: { x: 362, y: 230.5, width: 547, height: 369, radius: 27 },
        base: [340, 647, 929, 647, 1080, 854, 222, 854],
        brand: { x: 386, y: 274 },
        nav: { x: 419, startY: 385, stepY: 44 },
    },
    post: {
        x: 532, y: 274, width: 281,
        videoHeight: 276, footerHeight: 49,
        paddingX: 17, headingTop: 32,
        transcriptTop: 73, transcriptBottom: 13,
    },
    thoughts: {
        supporting: [{ x: 44, y: 259 }, { x: 44, y: 408 }],
        questioning: [{ x: 1009, y: 223 }, { x: 1007, y: 391 }],
        button: { x: 909, y: 628 },
    },
} as const;

export const NAV_ITEMS = ['Home', 'Notifications', 'Messages', 'Profile'] as const;

export interface ThoughtOption {
    /* MCQ metadata for answers */
    id: string;
    text: string;
    stance: 'supporting' | 'questioning';
}

export const BACK_BUTTON_SIZE = 0.047;

export interface SocialPost {
    id: string;
    app: string;
    heading: string;
    author: string;
    preview: string;
    transcript: readonly string[];
    thoughts: readonly [ThoughtOption, ThoughtOption, ThoughtOption, ThoughtOption];
    // The story evidence (see Journal/storyEvidence.ts) saved to the journal on Finish.
    evidenceIds: readonly string[];
}

export interface SocialLevel {
    id: string;
    posts: readonly SocialPost[];
}

// Each level supplies its own posts and four answer options; the view reads this data without hardcoding content.
export const SOCIAL_LEVELS = {
    catnip: {
        id: 'catnip',
        posts: [{
            id: 'catnip-influencer',
            app: 'Kitstagram',
            heading: 'Video goes in this box!',
            author: 'totallynotpaidinfluencer',
            preview: '@bigdruginc just dropped the most delicious...',
            evidenceIds: ['ev-rentfreecat-post'],
            transcript: [
                "Transcript:\nStop scrolling. Your doctor is NOT going to tell you this. This might be the best catnip I've ever tried. And I've tried them ALL.",
                "Studies show 97% of cats prefer this brand. I can't say which studies, they got taken down, but they exist.",
                "Go to your local cat mart and find the ones sold by @bigdruginc before they sell out. They're just SO good!",
                'If you liked this video, make sure to drop a like and watch my next video!',
            ],
            thoughts: [
                { id: 'catnip-support-1', text: 'My cat might\nactually love it!', stance: 'supporting' },
                { id: 'catnip-support-2', text: 'Maybe it really\nis a good deal?', stance: 'supporting' },
                { id: 'catnip-question-1', text: 'Where are those\n97% studies?', stance: 'questioning' },
                { id: 'catnip-question-2', text: 'Is this secretly\na paid ad?', stance: 'questioning' },
            ],
        }],
    },
} satisfies Record<string, SocialLevel>;

export type SocialLevelId = keyof typeof SOCIAL_LEVELS;
export const DEFAULT_LEVEL: SocialLevelId = 'catnip';

export function getSocialLevel(id: SocialLevelId): SocialLevel {
    return SOCIAL_LEVELS[id];
}

// Resolve the active post and fail early if the caller requests an index outside the level.
export function getSocialPost(levelId: SocialLevelId, postIndex = 0): SocialPost {
    const post = getSocialLevel(levelId).posts[postIndex];
    if (!post) throw new RangeError(`Unknown post index ${postIndex} for level ${levelId}`);
    return post;
}
