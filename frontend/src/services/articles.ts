// The data for one Articles activity. Mock until the backend has an
// articles route: see getArticleActivity below

// The trusted source shown on the left (the research study). Everything here
// is true.
export interface Transcript {
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
}

// evidenceIds: the story evidence (see Journal/storyEvidence.ts) the player
// adds to the journal once they find all the misinformation.
export interface ArticleActivity {
  transcript: Transcript;
  segments: ArticleSegment[];
  answerKey: AnswerKeyEntry[];
  evidenceIds: string[];
}

// MOCK: until the backend has an articles route. The study is the trusted
// source, and sentences s2 and s4 are the misinformation.
const MOCK_ACTIVITY: ArticleActivity = {
  transcript: {
    text:
      'Study on new users of the Catnip finds that 92% of cats are much happier in week 1 of using Catnip. ' +
      'As use continues over time cats find themselves less happy yet more addicted. By week 4 cats are less ' +
      'happy than the control group where cats have never used Catnip. Users found it harder to relax over time.',
  },
  segments: [
    { id: 's1', text: 'New Study by UC Cat City tests use of Catnip in new users.' },
    { id: 's2', text: 'The Study praises Catnip as a helpful way for cats to relax after a long day.' },
    { id: 's3', text: 'Catnip has been very popular lately and perhaps this study tells us why.' },
    { id: 's4', text: "Study finds that over 90% of users are much happier on Catnip than those who aren't." },
    { id: 's5', text: "As Catnip becomes more popular, we're very happy to hear of these positive benefits." },
  ],
  answerKey: [{ segmentId: 's2' }, { segmentId: 's4' }],
  evidenceIds: ['ev-cnn-article', 'ev-cnn-owner', 'ev-ucc-study'],
};

// Async like a real fetch would be, so the model already handles loading and
// errors. Only this function changes when the backend route exists.
export async function getArticleActivity(): Promise<ArticleActivity> {
  return MOCK_ACTIVITY;
}
