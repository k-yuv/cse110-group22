// Talks to the AI minigame routes on the backend (see backend/openapi.yaml and
// internal-docs/AI-Minigame.md). The backend never says which images are AI:
// each guess is sent on its own and the backend only says if it was right.

export interface AiImage {
  id: string;
  // URL to load the picture from, e.g. /api/images/cat.jpg
  src: string;
  alt: string;
}

export interface AiAnswerResult {
  correct: boolean;
}

// Every image, in the order they should be shown.
export async function getAiImages(): Promise<AiImage[]> {
  const response = await fetch('/api/ai-images');

  if (!response.ok) {
    throw new Error('Failed to fetch AI images');
  }

  return response.json();
}

// Sends the player's guess for one image. `isAi: true` means "this image is AI".
export async function submitAiAnswer(id: string, isAi: boolean): Promise<AiAnswerResult> {
  const response = await fetch(`/api/ai-images/${encodeURIComponent(id)}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isAi }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit answer');
  }

  return response.json();
}
