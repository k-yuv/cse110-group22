import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { completeActivity } from '../../services/progress';
import { ROUTES } from '../../routes';
import {
  canClean,
  isDeskClean,
  needsScrubbing,
  placeMesses,
  scrub,
  startingDirtiness,
  type Mess,
  type ToolId,
} from './deskCleanupRules';
import { BLOCKED_AREAS, CORNER_BUTTONS, MESSAGE_SECONDS, MESSES, STILL_DIRTY_MESSAGE } from './deskCleanupContent';
import { useBackConfirmationModel } from '../Back-Confirmation/backConfirmationModel';

function getWindowSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

// Owns where the messes are, which tool is held, how dirty each mess is, and
// finishing the minigame.
export function useDeskCleanupModel() {
  const navigate = useNavigate();
  const [size, setSize] = useState(getWindowSize);
  // Picked once when the minigame opens, so the messes stay put while playing.
  // They also stay out of the corner with the settings, hint and back buttons.
  const [placements] = useState(() => {
    const corner = {
      left: 0,
      top: 0,
      right: CORNER_BUTTONS.width / window.innerWidth,
      bottom: CORNER_BUTTONS.height / window.innerHeight,
    };
    return placeMesses(MESSES, window.innerWidth / window.innerHeight, [...BLOCKED_AREAS, corner], Math.random);
  });
  const [heldTool, setHeldTool] = useState<ToolId | null>(null);
  const [dirtiness, setDirtiness] = useState(() => startingDirtiness(MESSES));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleResize = () => setSize(getWindowSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // The message goes away on its own once the view has faded it out.
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), MESSAGE_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [message]);

  // Clicking the held tool's slot puts it back. Clicking another tool swaps to it.
  function handleToolClick(tool: ToolId) {
    setHeldTool((held) => (held === tool ? null : tool));
  }

  // Trash and shred: one click with the right tool cleans it.
  function handleMessClick(mess: Mess) {
    if (needsScrubbing(mess) || !canClean(mess, heldTool)) return;
    setDirtiness((current) => ({ ...current, [mess.id]: 0 }));
    setMessage('');
  }

  // Stains: the view reports how far the sponge moved over the stain.
  function handleScrub(mess: Mess, distance: number, messWidth: number) {
    if (!needsScrubbing(mess) || !canClean(mess, heldTool)) return;
    setDirtiness((current) => ({ ...current, [mess.id]: scrub(current[mess.id], distance, messWidth) }));
    setMessage('');
  }

  // Only leaves once the whole desk is clean. If saving fails, the player
  // stays and can press Continue again.
  async function handleContinue() {
    if (!isDeskClean(dirtiness)) {
      setMessage(STILL_DIRTY_MESSAGE);
      return;
    }

    try {
      await completeActivity('deskMinigame');
      navigate(ROUTES.desk);
    } catch {
      setError('Could not save progress');
    }
  }

  // Nothing is saved until Continue, so leaving always loses the cleaning
  // done so far: ask first.
  const { onBack, confirmation } = useBackConfirmationModel({ onLeave: () => navigate(ROUTES.desk) });

  return {
    width: size.width,
    height: size.height,
    placements,
    heldTool,
    dirtiness,
    isClean: isDeskClean(dirtiness),
    message,
    error,
    onToolClick: handleToolClick,
    onMessClick: handleMessClick,
    onScrub: handleScrub,
    onContinue: handleContinue,
    onBack,
    backConfirmation: confirmation,
  };
}
