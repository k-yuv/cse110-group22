import type { AnswerKeyEntry } from '../../services/articles';

type Evidence = AnswerKeyEntry['evidence'];

// TODO: stand-in for the Journal on feature/article-writing (#36). Once it's
// merged into dev, replace addEvidence's body with
// JournalController.getInstance().add(new EvidenceModel(...)).
const collectedEvidence: Evidence[] = [];

export function addEvidence(evidence: Evidence) {
  collectedEvidence.push(evidence);
}
