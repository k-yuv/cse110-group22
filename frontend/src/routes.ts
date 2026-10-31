// The URL of each screen. Screens that aren't built yet have no <Route> in
// App.tsx, so going to them shows the 404 page.
export const ROUTES = {
  desk: '/',
  onlineArticle: '/online-article',
  socialMedia: '/social-media',
  interview: '/interview',
  aiImage: '/ai-image',
  cleanDesk: '/clean-desk',
  createArticle: '/create-article',
} as const;
