import app from './app';
import { seedData } from './utils/seed';

const PORT = 3000;

// Fill in any missing data files before accepting requests.
seedData().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
