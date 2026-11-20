import type { ArticleEnding } from '../../services/article';

// The words shown on an ending screen. The art is picked by the view.
export interface EndingContent {
  headline: string;
  // Smaller words set beside the headline ("You Lost" + "Your Job").
  headlineAside?: string;
  subheadline: string;
  message: string;
}

// Every ending scene is drawn in this coordinate space (the Figma frame size)
// and scaled to fit the window.
export const SCENE_WIDTH = 1280;
export const SCENE_HEIGHT = 832;

export const RETURN_TO_TITLE_TEXT = 'Return to Title Screen';

export const ENDING_CONTENT: Record<ArticleEnding, EndingContent> = {
  good: {
    headline: 'CEO: Arrested',
    subheadline: 'Big Drug Inc. boss taken into custody after your story',
    message:
      'Your article made the front page, and it held up. Every claim was backed by ' +
      'reliable evidence: official reports, records and first-hand accounts instead of ' +
      'rumors and anonymous posts. With facts nobody could argue with, the police ' +
      'arrested the CEO of Big Drug Inc.',
  },
  bad: {
    headline: 'You Lost',
    headlineAside: 'Your Job',
    subheadline: 'Your article was retracted the day after it ran',
    message:
      'Your story leaned on weak and unreliable evidence: rumors, anonymous posts and ' +
      'sources that had nothing to do with the question. Big Drug Inc. picked it apart, ' +
      'the paper had to take it back, and the CEO walked free. Next time, back every ' +
      'claim with evidence you can trust.',
  },
};
