import { describe, it, expect, beforeEach } from 'vitest';
import { hasSeenLetter, markLetterSeen } from '../letter';

describe('letter service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with the letter unread', () => {
    expect(hasSeenLetter()).toBe(false);
  });

  it('remembers the letter was read', () => {
    markLetterSeen();

    expect(hasSeenLetter()).toBe(true);
  });
});
