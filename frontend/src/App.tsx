import { useState } from 'react';
import Notes from './components/Notes/notesView';
import KonvaTest from './components/Konva-Test/konvaView';
import ArticleWriting from './components/Article-Writing/articleWritingView';
import GoodEnding from './components/Endings/goodEndingView';
import BadEnding from './components/Endings/badEndingView';
import { seedMockEvidence } from './components/Journal/mockEvidence';
import type { ArticleEnding } from './services/article';

seedMockEvidence();

function App() {
  // Set once the article is submitted; switches to that ending's page.
  const [ending, setEnding] = useState<ArticleEnding | null>(null);

  if (ending === 'good') return <GoodEnding />;
  if (ending === 'bad') return <BadEnding />;

  return <>
    <Notes />;
    <KonvaTest />
    <ArticleWriting onFinish={setEnding} />
  </>
}

export default App;
