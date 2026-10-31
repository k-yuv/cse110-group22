import Notes from './components/Notes/notesView';
import KonvaTest from './components/Konva-Test/konvaView';
import ArticleWriting from './components/Article-Writing/articleWritingView';
import { seedMockEvidence } from './components/Journal/mockEvidence';
import type { ArticleEnding } from './services/article';

seedMockEvidence();

// TODO: route to the Good/Bad Ending screens once #32 and #33 exist.
function handleArticleFinish(ending: ArticleEnding) {
  console.log(`Article submitted: ${ending} ending`);
}

function App() {
  return <>
    <Notes />;
    <KonvaTest />
    <ArticleWriting onFinish={handleArticleFinish} />
  </>
}

export default App;
