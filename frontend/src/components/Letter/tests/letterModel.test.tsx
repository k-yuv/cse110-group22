import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useLetterModel } from '../letterModel';
import { hasSeenLetter, markLetterSeen } from '../../../services/letter';

describe('useLetterModel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts open the first time', () => {
    const { result } = renderHook(() => useLetterModel());

    expect(result.current.isOpen).toBe(true);
  });

  it('closes and remembers the letter was read when it is put away', () => {
    const { result } = renderHook(() => useLetterModel());

    act(() => result.current.onPutAway());

    expect(result.current.isOpen).toBe(false);
    expect(hasSeenLetter()).toBe(true);
  });

  it('starts closed once the letter has been read', () => {
    markLetterSeen();

    const { result } = renderHook(() => useLetterModel());

    expect(result.current.isOpen).toBe(false);
  });

  it('opens again when asked', () => {
    markLetterSeen();
    const { result } = renderHook(() => useLetterModel());

    act(() => result.current.onOpen());

    expect(result.current.isOpen).toBe(true);
  });
});
