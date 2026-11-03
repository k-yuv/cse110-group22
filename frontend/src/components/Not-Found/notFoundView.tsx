import { Link } from 'react-router';
import { ROUTES } from '../../routes';

// Shown for any URL without a matching route, including screens that
// haven't been built yet.
export default function NotFound() {
  return (
    <section>
      <h1>404: Page not found</h1>
      <p>This page doesn't exist yet.</p>
      <Link to={ROUTES.desk}>Back to desk</Link>
    </section>
  );
}
