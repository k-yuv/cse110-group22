import { useEffect, useState, useSyncExternalStore } from 'react';
import { JournalController } from './JournalController';
import { MAX_WIDTH_TO_HEIGHT, NOTES_PER_SPREAD } from './journalContent';
import { paginate } from '../../helpers';
import { seedMockEvidence } from './mockEvidence';

function getWindowSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

function subscribe(listener: () => void) {
  return JournalController.getInstance().subscribe(listener);
}

function readEvidence() {
  return JournalController.getInstance().read();
}

// Owns opening the journal and turning its pages. The evidence itself lives in
// JournalController, and this re-renders whenever it changes.
export function useJournalViewModel() {
  const evidence = useSyncExternalStore(subscribe, readEvidence);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(getWindowSize);

  useEffect(() => {
    const handleResize = () => setSize(getWindowSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const spreads = paginate(evidence, NOTES_PER_SPREAD);
  const pageCount = spreads.length;
  // Evidence can be removed while the journal is open if saving it fails.
  const currentPage = Math.min(page, pageCount - 1);

  // Opens on the newest evidence, which is what the player just collected.
  function handleOpen() {
    setPage(pageCount - 1);
    setIsOpen(true);
  }

  return {
    isOpen,
    width: size.width,
    height: size.height,
    sizeUnit: Math.min(size.width, size.height * MAX_WIDTH_TO_HEIGHT),
    spreadEvidence: spreads[currentPage],
    page: currentPage + 1,
    pageCount,
    hasPreviousPage: currentPage > 0,
    hasNextPage: currentPage < pageCount - 1,
    onOpen: handleOpen,
    onClose: () => setIsOpen(false),
    onPreviousPage: () => setPage(currentPage - 1),
    onNextPage: () => setPage(currentPage + 1),
  };
}

// Used once, by App: fetches the saved evidence before any screen can read it.
export function useJournalLoader() {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    JournalController.getInstance()
      .load()
      .then(() => {
        // Only after loading, or every reload would see an empty journal. Not
        // after a failure either, which isn't the same as having no evidence.
        seedMockEvidence();
        setFailed(false);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [attempt]);

  return {
    loading,
    failed,
    onRetry: () => {
      setLoading(true);
      setAttempt((current) => current + 1);
    },
  };
}
