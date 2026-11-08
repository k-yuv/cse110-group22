import { describe, it, expect } from 'vitest';
import { paginate } from '../helpers';

function numbers(count: number) {
  return Array.from({ length: count }, (_, index) => index + 1);
}

describe('paginate', () => {
  it('has one empty page for an empty list', () => {
    expect(paginate([], 6)).toEqual([[]]);
  });

  it('keeps a shorter list on one page', () => {
    expect(paginate(numbers(5), 6)).toEqual([[1, 2, 3, 4, 5]]);
  });

  it('keeps a list that exactly fills a page on one page', () => {
    expect(paginate(numbers(6), 6)).toEqual([[1, 2, 3, 4, 5, 6]]);
  });

  it('starts a new page with one item past the boundary', () => {
    expect(paginate(numbers(7), 6)).toEqual([[1, 2, 3, 4, 5, 6], [7]]);
  });

  it('does not add an empty page when the last page is exactly full', () => {
    expect(paginate(numbers(12), 6)).toHaveLength(2);
  });

  it('does not change the original list', () => {
    const items = numbers(7);

    paginate(items, 6);

    expect(items).toEqual(numbers(7));
  });
});
