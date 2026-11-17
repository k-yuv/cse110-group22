import type { AnswerKeyEntry } from '../../services/articles';
import { EvidenceModel } from '../Journal/EvidenceModel';
import { JournalController } from '../Journal/JournalController';

type Evidence = AnswerKeyEntry['evidence'];

// Article evidence has no icon. Resolves to false if it couldn't be saved.
export function addEvidence(evidence: Evidence): Promise<boolean> {
  return JournalController.getInstance().add(
    new EvidenceModel(evidence.id, evidence.toolName, evidence.toolDescription, ''),
  );
}
