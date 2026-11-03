import { describe, it, expect } from 'vitest';
import { getResultMessage, gradeHighlights, toggleHighlight } from '../newsArticleRules';
import type { AnswerKeyEntry } from '../../../services/articles';

// Sentences s2 and s4 are the misinformation. Grading only looks at ids, so
// the evidence is left blank.
const ANSWER_KEY: AnswerKeyEntry[] = ['s2', 's4'].map((segmentId) => ({
  segmentId,
  evidence: { id: segmentId, toolName: '', toolDescription: '' },
}));

describe('gradeHighlights', () => {
  it.each([
    {
      name: 'exact',
      highlighted: ['s2', 's4'],
      expected: { correct: ['s2', 's4'], missed: [], extra: [], passed: true },
    },
    {
      name: 'partial',
      highlighted: ['s2'],
      expected: { correct: ['s2'], missed: ['s4'], extra: [], passed: false },
    },
    {
      name: 'extra',
      highlighted: ['s2', 's4', 's1'],
      expected: { correct: ['s2', 's4'], missed: [], extra: ['s1'], passed: false },
    },
    {
      name: 'empty',
      highlighted: [],
      expected: { correct: [], missed: ['s2', 's4'], extra: [], passed: false },
    },
  ])('grades $name highlights', ({ highlighted, expected }) => {
    expect(gradeHighlights(highlighted, ANSWER_KEY)).toEqual(expected);
  });
});

describe('toggleHighlight', () => {
  it('adds a sentence that is not highlighted', () => {
    expect(toggleHighlight(['s1'], 's2')).toEqual(['s1', 's2']);
  });

  it('removes a sentence that is already highlighted', () => {
    expect(toggleHighlight(['s1', 's2'], 's1')).toEqual(['s2']);
  });

  it('does not change the array it was given', () => {
    const highlighted = ['s1'];
    toggleHighlight(highlighted, 's2');
    expect(highlighted).toEqual(['s1']);
  });
});

describe('getResultMessage', () => {
  it('says how many false sentences were found, and whether any true ones were highlighted', () => {
    const partial = getResultMessage(gradeHighlights(['s2'], ANSWER_KEY));
    const withExtra = getResultMessage(gradeHighlights(['s2', 's1'], ANSWER_KEY));

    expect(partial).toContain('1 of 2');
    expect(withExtra).toContain('1 of 2');
    expect(withExtra).not.toBe(partial);
  });

  it('gives a different message when the player passes', () => {
    const passed = getResultMessage(gradeHighlights(['s2', 's4'], ANSWER_KEY));
    const failed = getResultMessage(gradeHighlights([], ANSWER_KEY));

    expect(passed).not.toBe(failed);
    expect(passed).not.toContain('of 2');
  });
});
