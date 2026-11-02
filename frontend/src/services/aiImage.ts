export interface AiImage {
  id: string;
  src: string;
  alt: string;
}

export type AiAnswers = Record<string, boolean>;

export interface AiResult {
  correct: number;
  total: number;
}

interface AiImageEntry extends AiImage {
  isAi: boolean;
}

function placeholder(label: string, color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">` +
    `<rect width="400" height="300" fill="${color}"/>` +
    `<text x="200" y="160" font-family="Arial" font-size="32" text-anchor="middle" fill="#ffffff">${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const DEFAULT_IMAGES: AiImageEntry[] = [
  { id: 'img-1', src: placeholder('Image 1', '#5b7c99'), alt: 'Placeholder image 1', isAi: true },
  { id: 'img-2', src: placeholder('Image 2', '#8a5b99'), alt: 'Placeholder image 2', isAi: false },
  { id: 'img-3', src: placeholder('Image 3', '#5b9973'), alt: 'Placeholder image 3', isAi: true },
  { id: 'img-4', src: placeholder('Image 4', '#99805b'), alt: 'Placeholder image 4', isAi: false },
  { id: 'img-5', src: placeholder('Image 5', '#995b5b'), alt: 'Placeholder image 5', isAi: true },
];

export async function getAiImages(): Promise<AiImage[]> {
  return DEFAULT_IMAGES.map(({ id, src, alt }) => ({ id, src, alt }));
}

// An unanswered image counts as wrong.
export async function checkAiAnswers(answers: AiAnswers): Promise<AiResult> {
  const correct = DEFAULT_IMAGES.filter((image) => answers[image.id] === image.isAi).length;
  return { correct, total: DEFAULT_IMAGES.length };
}
