import { BrowserRouter, Route, Routes, useNavigate } from 'react-router';
import Desk from './components/Desk/deskView';
import ArticleWriting from './components/Article-Writing/articleWritingView';
import GoodEnding from './components/Endings/goodEndingView';
import BadEnding from './components/Endings/badEndingView';
import NotFound from './components/Not-Found/notFoundView';
import { seedMockEvidence } from './components/Journal/mockEvidence';
import { ROUTES } from './routes';

seedMockEvidence();

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
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.desk} element={<Desk />} />
        <Route path={ROUTES.createArticle} element={<ArticleWritingPage />} />
        <Route path={ROUTES.goodEnding} element={<GoodEnding />} />
        <Route path={ROUTES.badEnding} element={<BadEnding />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
