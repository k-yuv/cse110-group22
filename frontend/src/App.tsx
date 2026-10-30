import { BrowserRouter, Route, Routes } from 'react-router';
import Desk from './components/Desk/deskView';
import NotFound from './components/Not-Found/notFoundView';
import { ROUTES } from './routes';

// Add a <Route> here for each screen as it's built, using its path from
// routes.ts. Keep the "*" route last: it catches every other URL.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.desk} element={<Desk />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
