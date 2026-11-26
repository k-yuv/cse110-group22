export const PAGE_TITLE = 'Social Media';
export const NEXT_LABEL = 'Next';
export const DONE_LABEL = 'Done';
export const PROGRESS_LABEL = 'Posts reviewed';
export const HINT_TEXT =
  'Decide whether each social media post is reliable. Pick the thought that best explains why, ' +
  'then press Next to review the next post.';
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
    // Glow effect color: BLUE; works way better against the white
    hoverGlow: '#2f7de1',
    correctGlow: '#2e9e44',
    correctFill: '#d4f5d0',
    wrongGlow: '#e02424',
} as const;

export const LAYOUT = {
    verticalOffset: -55,
    deskTop: 561,
    laptopOffset: { x: 5, y: -25 },
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
        slots: [{ x: 44, y: 249 }, { x: 44, y: 408 }, { x: 1009, y: 213 }, { x: 1007, y: 381 }],
        bubble: { width: 230, height: 130, fontSize: 15 },
        button: { x: 909, y: 628 },
    },
    feedback: { x: 380, y: 57, width: 520, height: 100, fontSize: 15 },
} as const;

export const NAV_ITEMS = ['Home', 'Notifications', 'Messages', 'Profile'] as const;

export interface ThoughtOption {
    /* MCQ metadata for answers */
    id: string;
    // Answer
    text: string;
    correct: boolean;
    feedback: string;
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
    evidenceIds: readonly string[];
}

export interface SocialLevel {
    id: string;
    posts: readonly SocialPost[];
}

// Each level supplies its own posts and four answer options; with one correct thought
export const SOCIAL_LEVELS = {
    catnip: {
        id: 'catnip',
        posts: [
            {
                id: 'catnip-influencer',
                app: 'Kitstagram',
                heading: 'BEST catnip EVER?!',
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
                    {
                        id: 'catnip-yes-studies',
                        text: 'Yes. 97% of cats prefer it, so it must be good.',
                        correct: false,
                        feedback: "Those studies can't be named or found. A statistic with no source isn't evidence.",
                    },
                    {
                        id: 'catnip-yes-tried',
                        text: "Yes. They've tried every brand, so they know best.",
                        correct: false,
                        feedback: 'Personal experience is not proof, especially from someone with a reason to sell.',
                    },
                    {
                        id: 'catnip-no-sponsored',
                        text: 'No. They push one brand with no #sponsored tag.',
                        correct: true,
                        feedback: "Right! Promoting @bigdruginc without disclosing it is a classic hidden ad. That's worth noting.",
                    },
                    {
                        id: 'catnip-no-cats',
                        text: 'No. Influencers never actually own cats.',
                        correct: false,
                        feedback: "That's an assumption, not a reason. Look at what the post claims and who benefits.",
                    },
                ],
            },
            {
                id: 'catnip-cnn-share',
                app: 'Chirper',
                heading: 'Catnip = happiness!',
                author: 'CatNewsNetwork',
                preview: 'BREAKING: UC Cat City study says 90% of cats...',
                // TODO: give this post its own entry in Journal/storyEvidence.ts ("public-opinion").
                evidenceIds: [],
                transcript: [
                    'Transcript:\nBREAKING: A new UC Cat City study finds over 90% of new catnip users feel much happier!',
                    'Long day at the scratching post? Our experts agree: a little catnip is the purr-fect way to relax.',
                    'Catnip from @bigdruginc, proud parent company of Cat News Network, is available now.',
                    '#SelfCare #CatWellness #Breaking',
                ],
                thoughts: [
                    {
                        id: 'cnn-yes-news',
                        text: "Yes. It's a big news network, so it must be true.",
                        correct: false,
                        feedback: 'A big name is not a guarantee. Check who owns the outlet and what it leaves out.',
                    },
                    {
                        id: 'cnn-no-owner',
                        text: 'No. Big Drug Inc. owns the network selling it.',
                        correct: true,
                        feedback: 'Exactly! The network is reporting on its own parent company. That conflict of interest matters.',
                    },
                    {
                        id: 'cnn-yes-study',
                        text: 'Yes. It cites a real university study.',
                        correct: false,
                        feedback: 'Citing a study is a start, but the post only shares the part that helps sales.',
                    },
                    {
                        id: 'cnn-no-hashtags',
                        text: 'No. Real news never uses hashtags.',
                        correct: false,
                        feedback: 'Plenty of trustworthy outlets use hashtags. Look at the source, not the styling.',
                    },
                ],
            },
            {
                id: 'catnip-researcher',
                app: 'Kitstagram',
                heading: 'Our full catnip study',
                author: 'Dr.Whiskers_UCCatCity',
                preview: 'We are sharing our complete 4-week results so...',
                // TODO: give this post its own entry in Journal/storyEvidence.ts ("public-opinion").
                evidenceIds: [],
                transcript: [
                    "Transcript:\nHi, I'm Dr. Whiskers, lead researcher on the UC Cat City catnip study. Some posts only share our week 1 numbers.",
                    'In week 1, 92% of cats were much happier. But by week 4 they were LESS happy than cats who never took it.',
                    'The full paper and data are linked in my bio and free to read. Our funding sources are listed on page 2.',
                    'Please read the whole study before you share it!',
                ],
                thoughts: [
                    {
                        id: 'study-no-negative',
                        text: 'No. It makes catnip sound bad, so it must be biased.',
                        correct: false,
                        feedback: "Disliking a result doesn't make it biased. This post shows its full data and funding.",
                    },
                    {
                        id: 'study-no-doctor',
                        text: "No. Anyone can call themselves a doctor online.",
                        correct: false,
                        feedback: 'Fair to be careful, but here the full paper, data and funding are public for you to check.',
                    },
                    {
                        id: 'study-yes-title',
                        text: "Yes. A doctor said it, so it can't be wrong.",
                        correct: false,
                        feedback: "A title alone isn't proof. What makes this reliable is the open data and funding.",
                    },
                    {
                        id: 'study-yes-data',
                        text: 'Yes. The researcher shares the full data and funding.',
                        correct: true,
                        feedback: 'Correct! Open data, the full results and disclosed funding make this a reliable source.',
                    },
                ],
            },
        ],
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
