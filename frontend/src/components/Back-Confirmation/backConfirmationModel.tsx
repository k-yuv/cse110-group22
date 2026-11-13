import { useEffect, useState } from 'react';

interface BackConfirmationOptions {
  // What leaving the activity does, e.g. navigate to the desk.
  onLeave: () => void;
  // False when there's no progress to lose (e.g. the activity is finished),
  // so the back button leaves straight away without asking.
  hasProgressToLose?: boolean;
}

// For a screen's model: owns whether the back confirmation is open, and
// Escape while it is. Spread the result's `confirmation` into
// <BackConfirmation> and give `onBack` to the screen's back button.
export function useBackConfirmationModel({ onLeave, hasProgressToLose = true }: BackConfirmationOptions) {
  const [isOpen, setIsOpen] = useState(false);

  // Escape is the same as Stay, so the player can't lose progress by accident.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  function handleBack() {
    if (hasProgressToLose) setIsOpen(true);
    else onLeave();
  }

  function handleGoBack() {
    setIsOpen(false);
    onLeave();
  }

  function handleStay() {
    setIsOpen(false);
  }

  return {
    onBack: handleBack,
    confirmation: {
      isOpen,
      onGoBack: handleGoBack,
      onStay: handleStay,
    },
  };
}
