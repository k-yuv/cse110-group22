// The data for one Articles activity. Mock until the backend has an
// articles route: see getArticleActivity below

// The trusted source shown on the left. Everything here is true
export interface Transcript {
  speaker: string;
  text: string;
}

// The player highlights whole sentences.
export interface ArticleSegment {
  id: string;
  text: string;
}

// A sentence that is misinformation
export interface AnswerKeyEntry {
  segmentId: string;
  evidence: { id: string; toolName: string; toolDescription: string };
}

export interface ArticleActivity {
  transcript: Transcript;
  segments: ArticleSegment[];
  answerKey: AnswerKeyEntry[];
}

// MOCK: placeholder story until the team writes the real one. Sentences s2
// and s4 don't match what the CEO actually said.
const MOCK_ACTIVITY: ArticleActivity = {
  transcript: {
    speaker: 'Big Drug Inc. CEO',
    text: "As many of you know, our best product is none other than our catnip. That's why we're taking the next step forward and releasing catnip Deluxe!",
  },
  segments: [
    { id: 's1', text: 'The CEO of Big Drug Inc. spoke on stage today.' },
    { id: 's2', text: "The CEO said catnip is the company's worst product." },
    { id: 's3', text: 'The company is releasing a new catnip Deluxe.' },
    { id: 's4', text: 'The CEO promised catnip Deluxe will be free.' },
    { id: 's5', text: 'The CEO called it the next step forward.' },
  ],
  answerKey: [
    {
      segmentId: 's2',
      evidence: {
        id: 'article-best-product',
        toolName: 'CEO speech: best product',
        toolDescription: 'The CEO called catnip their best product, not their worst.',
      },
    },
    {
      segmentId: 's4',
      evidence: {
        id: 'article-not-free',
        toolName: 'CEO speech: not free',
        toolDescription: 'The CEO never said catnip Deluxe would be free.',
      },
    },
  ],
};

// Async like a real fetch would be, so the model already handles loading and
// errors. Only this function changes when the backend route exists.
export async function getArticleActivity(): Promise<ArticleActivity> {
  return MOCK_ACTIVITY;
}
