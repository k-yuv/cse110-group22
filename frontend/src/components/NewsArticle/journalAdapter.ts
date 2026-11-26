import { JournalController } from '../Journal/JournalController';
import { ALL_STORY_EVIDENCE } from '../Journal/storyEvidence';

// Adds one piece of story evidence to the journal by its id, so its title and
// description come from storyEvidence.ts. Resolves to false if there's no
// evidence with that id or it couldn't be saved.
export function addEvidence(id: string): Promise<boolean> {
  const evidence = ALL_STORY_EVIDENCE.find((item) => item.id === id);
  return evidence ? JournalController.getInstance().add(evidence) : Promise.resolve(false);
}
