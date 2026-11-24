import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { getProgress } from '../../services/progress';
import { isScreenLocked, type LockableScreen } from '../Desk/deskRules';

// Every screen the guard can protect: the ones that unlock with progress
// (see deskRules.ts), plus the endings.
export type GuardedScreen = LockableScreen | 'ending';

// Router state ArticleWriting passes along when it sends the player to an
// ending. Typing an ending's URL has no state, so the guard sends them away.
// BrowserRouter keeps state in the browser history, so a reload still works.
export interface EndingState {
  articleSubmitted: true;
}

export type GuardStatus = 'loading' | 'unlocked' | 'locked';

// Decides whether the player may open `screen`. Progress-based screens load
// saved progress first; if it can't be loaded, the screen counts as locked.
export function useRouteGuardModel(screen: GuardedScreen) {
  const state = useLocation().state as Partial<EndingState> | null;
  const [progressStatus, setProgressStatus] = useState<GuardStatus>('loading');

  useEffect(() => {
    if (screen === 'ending') return;
    let cancelled = false;

    getProgress()
      .then((completed) => {
        if (!cancelled) setProgressStatus(isScreenLocked(screen, completed) ? 'locked' : 'unlocked');
      })
      .catch(() => {
        if (!cancelled) setProgressStatus('locked');
      });

    return () => {
      cancelled = true;
    };
  }, [screen]);

  const endingStatus: GuardStatus = state?.articleSubmitted ? 'unlocked' : 'locked';
  return { status: screen === 'ending' ? endingStatus : progressStatus };
}
