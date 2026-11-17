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

export const POST = {
    app: 'Kitstagram',
    heading: 'Video goes in this box!',
    author: 'totallynotpaidinfluencer',
    preview: '@bigdruginc just dropped the most delicious...',
    transcript: [
        "Transcript:\nStop scrolling. Your doctor is NOT going to tell you this. This might be the best catnip I've ever tried. And I've tried them ALL.",
        "Studies show 97% of cats prefer this brand. I can't say which studies, they got taken down, but they exist.",
        "Go to your local cat mart and find the ones sold by @bigdruginc before they sell out. They're just SO good!",
        'If you liked this video, make sure to drop a like and watch my next video!',
    ],
} as const;

export const NAV_ITEMS = [
    { text: 'Home', y: 384 },
    { text: 'Notifications', y: 429 },
    { text: 'Messages', y: 473 },
    { text: 'Profile', y: 516 },
] as const;
