import { useState } from 'react';
import { hasSeenLetter, markLetterSeen } from '../../services/letter';

// Owns whether the whistleblower's letter is open. It opens on its own only
// the first time the player reaches the desk. After it's put away, only the
// hint button opens it again.
export function useLetterModel() {
  const [isOpen, setIsOpen] = useState(() => !hasSeenLetter());

  function handleOpen() {
    setIsOpen(true);
  }

  function handlePutAway() {
    markLetterSeen();
    setIsOpen(false);
  }

  return { isOpen, onOpen: handleOpen, onPutAway: handlePutAway };
}
