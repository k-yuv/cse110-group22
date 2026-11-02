import { BrowserRouter, Route, Routes } from 'react-router';
import Desk from './components/Desk/deskView';
import NotFound from './components/Not-Found/notFoundView';
import TitleScreen from './components/TitleScreen/titleScreenView';
<<<<<<< HEAD
import NewsArticle from './components/NewsArticle/newsArticleView';
=======
>>>>>>> origin/dev
import { ROUTES } from './routes';

// Add a <Route> here for each screen as it's built, using its path from
// routes.ts. Keep the "*" route last: it catches every other URL.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.title} element={<TitleScreen />} />
        <Route path={ROUTES.desk} element={<Desk />} />
<<<<<<< HEAD
        <Route path={ROUTES.onlineArticle} element={<NewsArticle />} />
=======
>>>>>>> origin/dev
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
