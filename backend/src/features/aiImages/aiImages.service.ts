import type { AiImage, StoredAiImage } from '../../app';
import { IMAGES_URL } from '../../utils/images';
import { readJson } from '../../utils/jsonStore';

// Services hold the business rules and read/write the data files. They know
// nothing about HTTP: they return data or throw, and the controller decides the status.

const AI_IMAGES_FILE = 'aiImages.json';

// Returns every image in the order they're saved, ready to send to the client:
// `fileName` becomes a `src` URL and the answer (`isAi`) is left out.
export async function getImages(): Promise<AiImage[]> {
  const images = await readJson<StoredAiImage[]>(AI_IMAGES_FILE, []);

  return images.map(({ id, fileName, alt }) => ({
    id,
    src: `${IMAGES_URL}/${encodeURIComponent(fileName)}`,
    alt,
  }));
}

// Returns whether the player's guess (`isAi`) matches the image, or null when
// no image has that id.
export async function checkAnswer(id: string, isAi: boolean): Promise<boolean | null> {
  const images = await readJson<StoredAiImage[]>(AI_IMAGES_FILE, []);
  const image = images.find((i) => i.id === id);
  if (!image) {
    return null;
  }

  return isAi === image.isAi;
}
