import { Link } from 'react-router';
import { ROUTES } from '../../routes';

export default function AiMinigame() {
  return (
    <section>
      <h1>AI Images</h1>
      <p>Is this image AI-generated?</p>
      <Link to={ROUTES.desk}>Back to desk</Link>
    </section>
  );
}
