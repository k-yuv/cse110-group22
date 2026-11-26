// Mock until the backend saves it: whether the player has read the
// whistleblower's letter is saved in localStorage (like services/progress.ts),
// so it only opens on its own once, even after a page reload.
export const LETTER_STORAGE_KEY = 'letterSeen';

export function hasSeenLetter(): boolean {
  try {
    return localStorage.getItem(LETTER_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markLetterSeen(): void {
  try {
    localStorage.setItem(LETTER_STORAGE_KEY, 'true');
  } catch {
    // Not saved, so the letter just opens again next time.
  }
}
