import { BrowserRouter, Route, Routes, useNavigate} from 'react-router';
import AiMinigame from './components/AI-Minigame/aiMinigameView';
import Desk from './components/Desk/deskView';
import ArticleWriting from './components/Article-Writing/articleWritingView';
import GoodEnding from './components/Endings/goodEndingView';
import BadEnding from './components/Endings/badEndingView';
import NotFound from './components/Not-Found/notFoundView';
import { LOADING_TEXT, LOAD_ERROR_TEXT, RETRY_LABEL } from './components/Journal/journalContent';
import { useJournalLoader } from './components/Journal/journalViewModel';
import TitleScreen from './components/TitleScreen/titleScreenView';
import NewsArticle from './components/NewsArticle/newsArticleView';
import { ROUTES } from './routes';

// Submitting the article goes to that ending's page.
function ArticleWritingPage() {
  const navigate = useNavigate();
  return (
    <ArticleWriting
      onFinish={(ending) => navigate(ending === 'good' ? ROUTES.goodEnding : ROUTES.badEnding)}
    />
  );
}

// Add a <Route> here for each screen as it's built, using its path from
// routes.ts. Keep the "*" route last: it catches every other URL.
function App() {
  const { loading, failed, onRetry } = useJournalLoader();

  // Screens read the journal as they open, so it has to be loaded first.
  if (loading) return <p>{LOADING_TEXT}</p>;
  if (failed) {
    return (
      <>
        <p role="alert">{LOAD_ERROR_TEXT}</p>
        <button type="button" onClick={onRetry}>{RETRY_LABEL}</button>
      </>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.title} element={<TitleScreen />} />
        <Route path={ROUTES.desk} element={<Desk />} />
        <Route path={ROUTES.createArticle} element={<ArticleWritingPage />} />
        <Route path={ROUTES.goodEnding} element={<GoodEnding />} />
        <Route path={ROUTES.badEnding} element={<BadEnding />} />
        <Route path={ROUTES.onlineArticle} element={<NewsArticle />} />
        <Route path={ROUTES.aiImage} element={<AiMinigame />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
