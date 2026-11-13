import { BrowserRouter, Route, Routes, useNavigate} from 'react-router';
import AiMinigame from './components/AI-Minigame/aiMinigameView';
import Desk from './components/Desk/deskView';
import ArticleWriting from './components/Article-Writing/articleWritingView';
import GoodEnding from './components/Endings/goodEndingView';
import BadEnding from './components/Endings/badEndingView';
import NotFound from './components/Not-Found/notFoundView';
import { seedMockEvidence } from './components/Journal/mockEvidence';
import TitleScreen from './components/TitleScreen/titleScreenView';
import NewsArticle from './components/NewsArticle/newsArticleView';
import SocialMedia from './components/Social-Media/socialMediaView';
import Interview from './components/Interview/interviewView';
import { ROUTES } from './routes';
import RouteGuard from './components/Route-Guard/routeGuardView';
import type { EndingState } from './components/Route-Guard/routeGuardModel';

seedMockEvidence();

const SUBMITTED: EndingState = { articleSubmitted: true };

// Submitting the article goes to that ending's page. The state lets the
// ending's guard know the player got there by submitting.
function ArticleWritingPage() {
  const navigate = useNavigate();
  return (
    <ArticleWriting
      onFinish={(ending) =>
        navigate(ending === 'good' ? ROUTES.goodEnding : ROUTES.badEnding, { state: SUBMITTED })
      }
    />
  );
}

// Add a <Route> here for each screen as it's built, using its path from
// routes.ts. Keep the "*" route last: it catches every other URL.
// Wrap screens that have to be unlocked first in <RouteGuard> so typing the
// URL can't skip ahead.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.title} element={<TitleScreen />} />
        <Route path={ROUTES.desk} element={<Desk />} />
        <Route
          path={ROUTES.createArticle}
          element={
            <RouteGuard screen="createArticle">
              <ArticleWritingPage />
            </RouteGuard>
          }
        />
        <Route
          path={ROUTES.goodEnding}
          element={
            <RouteGuard screen="ending">
              <GoodEnding />
            </RouteGuard>
          }
        />
        <Route
          path={ROUTES.badEnding}
          element={
            <RouteGuard screen="ending">
              <BadEnding />
            </RouteGuard>
          }
        />
        <Route path={ROUTES.onlineArticle} element={<NewsArticle />} />
        <Route
          path={ROUTES.socialMedia}
          element={
            <RouteGuard screen="social">
              <SocialMedia />
            </RouteGuard>
          }
        />
        <Route
          path={ROUTES.interview}
          element={
            <RouteGuard screen="interviews">
              <Interview />
            </RouteGuard>
          }
        />
        <Route path={ROUTES.aiImage} element={<AiMinigame />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
