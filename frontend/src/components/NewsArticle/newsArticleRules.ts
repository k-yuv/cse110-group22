import type { AnswerKeyEntry } from '../../services/articles';

export interface GradeResult {
  correct: string[];
  missed: string[];
  extra: string[];
  passed: boolean;
}

// Highlights the sentence, or removes the highlight if it already has one.
export function toggleHighlight(highlightedIds: readonly string[], id: string): string[] {
  return highlightedIds.includes(id)
    ? highlightedIds.filter((highlighted) => highlighted !== id)
    : [...highlightedIds, id];
}

// The player passes only by finding every false sentence and nothing else,
// so highlighting the whole article doesn't work.
export function gradeHighlights(
  highlightedIds: readonly string[],
  answerKey: readonly AnswerKeyEntry[],
): GradeResult {
  const answerIds = answerKey.map((entry) => entry.segmentId);
  const correct = highlightedIds.filter((id) => answerIds.includes(id));
  const missed = answerIds.filter((id) => !highlightedIds.includes(id));
  const extra = highlightedIds.filter((id) => !answerIds.includes(id));

  return { correct, missed, extra, passed: missed.length === 0 && extra.length === 0 };
}

// What the player is told after submitting. On a fail it says how close they
// were, without giving away which sentences are wrong.
export function getResultMessage({ correct, missed, extra, passed }: GradeResult): string {
  if (passed) return 'You found all the misinformation!';

  const found = `You found ${correct.length} of ${correct.length + missed.length} false sentences.`;
  return extra.length > 0 ? `${found} Some sentences you highlighted are true.` : found;
}
