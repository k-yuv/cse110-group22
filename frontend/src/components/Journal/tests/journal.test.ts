import { describe, it, expect, beforeEach } from 'vitest';
import { EvidenceModel } from '../EvidenceModel';
import { JournalController } from '../JournalController';
import { seedMockEvidence } from '../mockEvidence';

describe('JournalController', () => {
  beforeEach(() => JournalController.getInstance().clear());

  it('is shared across the app', () => {
    expect(JournalController.getInstance()).toBe(JournalController.getInstance());
  });

  it('adds, reads and clears evidence', () => {
    const journal = JournalController.getInstance();
    const evidence = new EvidenceModel('a', 'Evidence A', 'About A', 'a.png');

    journal.add(evidence);
    expect(journal.read()).toEqual([evidence]);

    journal.clear();
    expect(journal.read()).toEqual([]);
  });
});

describe('seedMockEvidence', () => {
  beforeEach(() => JournalController.getInstance().clear());

  it('fills an empty journal with the mock evidence', () => {
    seedMockEvidence();

    const evidence = JournalController.getInstance().read();
    expect(evidence.length).toBeGreaterThan(0);
    expect(new Set(evidence.map((item) => item.id)).size).toBe(evidence.length);
  });

  it('leaves a journal that already has evidence alone', () => {
    const journal = JournalController.getInstance();
    const collected = new EvidenceModel('real', 'Collected', '', '');
    journal.add(collected);

    seedMockEvidence();

    expect(journal.read()).toEqual([collected]);
  });

  it('does not add the mock evidence twice', () => {
    seedMockEvidence();
    const count = JournalController.getInstance().read().length;

    seedMockEvidence();

    expect(JournalController.getInstance().read()).toHaveLength(count);
  });
});
