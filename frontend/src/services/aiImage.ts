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

function placeholder(color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">` +
    `<rect width="400" height="400" fill="${color}"/>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const DEFAULT_IMAGES: AiImageEntry[] = [
  { id: 'img-1', src: placeholder('#dfa0c0'), alt: 'Pink placeholder image', isAi: true },
  { id: 'img-2', src: placeholder('#a0c4e0'), alt: 'Blue placeholder image', isAi: false },
  { id: 'img-3', src: placeholder('#a8d5a2'), alt: 'Green placeholder image', isAi: true },
  { id: 'img-4', src: placeholder('#f2d48f'), alt: 'Yellow placeholder image', isAi: false },
  { id: 'img-5', src: placeholder('#c3a6e0'), alt: 'Purple placeholder image', isAi: true },
];

export async function getAiImages(): Promise<AiImage[]> {
  return DEFAULT_IMAGES.map(({ id, src, alt }) => ({ id, src, alt }));
}

export async function checkAiAnswers(answers: AiAnswers): Promise<AiResult> {
  const correct = DEFAULT_IMAGES.filter((image) => answers[image.id] === image.isAi).length;
  return { correct, total: DEFAULT_IMAGES.length };
}
