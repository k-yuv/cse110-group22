import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EvidenceModel } from '../EvidenceModel';
import { JournalController } from '../JournalController';
import { ALL_STORY_EVIDENCE, STORY_EVIDENCE } from '../storyEvidence';
import { getArticleActivity } from '../../../services/articles';
import { INTERVIEW_QUESTIONS } from '../../Interview/InterviewModel';
import { SOCIAL_LEVELS } from '../../Social-Media/socialMediaContent';
import { addEvidence, clearEvidence, getEvidence } from '../../../services/journal';

// The real (mock) service, except each call can be made to fail in a single
// test with mockRejectedValueOnce.
vi.mock('../../../services/journal', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/journal')>();
  return {
    ...actual,
    getEvidence: vi.fn(actual.getEvidence),
    addEvidence: vi.fn(actual.addEvidence),
    clearEvidence: vi.fn(actual.clearEvidence),
  };
});

const EVIDENCE = new EvidenceModel('a', 'Evidence A', 'About A', 'a.png');

function resetJournal() {
  localStorage.clear();
  JournalController.resetInstance();
}

// What a page reload does: memory is gone, and only what was saved comes back.
async function reload() {
  JournalController.resetInstance();
  const journal = JournalController.getInstance();
  await journal.load();
  return journal;
}

describe('JournalController', () => {
  beforeEach(resetJournal);

  it('is shared across the app', () => {
    expect(JournalController.getInstance()).toBe(JournalController.getInstance());
  });

  it('adds, reads and clears evidence', () => {
    const journal = JournalController.getInstance();

    journal.add(EVIDENCE);
    expect(journal.read()).toEqual([EVIDENCE]);

    journal.clear();
    expect(journal.read()).toEqual([]);
  });

  it('does not add the same id twice, and keeps the first one', async () => {
    const journal = JournalController.getInstance();

    await journal.add(EVIDENCE);
    const added = await journal.add(new EvidenceModel('a', 'Changed', '', ''));

    expect(added).toBe(true);
    expect(journal.read()).toEqual([EVIDENCE]);
    expect(addEvidence).toHaveBeenCalledTimes(1);
  });

  it('gives a new list after each change, so React sees it changed', async () => {
    const journal = JournalController.getInstance();
    const before = journal.read();

    await journal.add(EVIDENCE);

    expect(journal.read()).not.toBe(before);
    expect(before).toEqual([]);
  });

  it('keeps the same list when nothing changed', async () => {
    const journal = JournalController.getInstance();
    await journal.add(EVIDENCE);
    const before = journal.read();

    await journal.add(EVIDENCE);

    expect(journal.read()).toBe(before);
  });

  describe('subscribe', () => {
    it('tells listeners about adding and clearing, until they stop listening', async () => {
      const journal = JournalController.getInstance();
      const listener = vi.fn();
      const unsubscribe = journal.subscribe(listener);

      await journal.add(EVIDENCE);
      expect(listener).toHaveBeenCalledTimes(1);

      await journal.clear();
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();
      await journal.add(EVIDENCE);
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('does not tell listeners about a duplicate', async () => {
      const journal = JournalController.getInstance();
      await journal.add(EVIDENCE);
      const listener = vi.fn();
      journal.subscribe(listener);

      await journal.add(EVIDENCE);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('persistence', () => {
    it('brings evidence back after a reload, as real EvidenceModels', async () => {
      await JournalController.getInstance().add(EVIDENCE);

      const journal = await reload();

      expect(journal.read()).toEqual([EVIDENCE]);
      expect(journal.read()[0]).toBeInstanceOf(EvidenceModel);
    });

    it('keeps the order evidence was added in', async () => {
      const journal = JournalController.getInstance();
      await journal.add(new EvidenceModel('first', 'First', '', ''));
      await journal.add(new EvidenceModel('second', 'Second', '', ''));

      const reloaded = await reload();

      expect(reloaded.read().map((item) => item.id)).toEqual(['first', 'second']);
    });

    it('does not bring evidence back once cleared', async () => {
      const journal = JournalController.getInstance();
      await journal.add(EVIDENCE);
      await journal.clear();

      expect((await reload()).read()).toEqual([]);
    });

    it('does not add a duplicate of evidence saved before a reload', async () => {
      await JournalController.getInstance().add(EVIDENCE);

      const journal = await reload();
      await journal.add(EVIDENCE);

      expect((await reload()).read()).toEqual([EVIDENCE]);
      expect(journal.read()).toHaveLength(1);
    });

    it('tells listeners when loading finishes', async () => {
      await JournalController.getInstance().add(EVIDENCE);
      JournalController.resetInstance();
      const journal = JournalController.getInstance();
      const listener = vi.fn();
      journal.subscribe(listener);

      await journal.load();

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('load', () => {
    it('only fetches once', async () => {
      const journal = JournalController.getInstance();

      await Promise.all([journal.load(), journal.load()]);
      await journal.load();

      expect(getEvidence).toHaveBeenCalledTimes(1);
    });

    it('fails when fetching fails, and can be tried again', async () => {
      vi.mocked(getEvidence).mockRejectedValueOnce(new Error('down'));
      const journal = JournalController.getInstance();

      await expect(journal.load()).rejects.toThrow('down');
      await expect(journal.load()).resolves.toBeUndefined();

      expect(getEvidence).toHaveBeenCalledTimes(2);
    });
  });

  describe('when saving fails', () => {
    it('shows new evidence right away, then removes it and reports the failure', async () => {
      vi.mocked(addEvidence).mockRejectedValueOnce(new Error('down'));
      const journal = JournalController.getInstance();

      const added = journal.add(EVIDENCE);
      expect(journal.read()).toEqual([EVIDENCE]);

      expect(await added).toBe(false);
      expect(journal.read()).toEqual([]);
    });

    it('keeps other evidence when removing the failed one', async () => {
      const journal = JournalController.getInstance();
      const saved = new EvidenceModel('saved', 'Saved', '', '');
      await journal.add(saved);
      vi.mocked(addEvidence).mockRejectedValueOnce(new Error('down'));

      await journal.add(EVIDENCE);

      expect(journal.read()).toEqual([saved]);
    });

    it('puts evidence back if clearing fails', async () => {
      const journal = JournalController.getInstance();
      await journal.add(EVIDENCE);
      vi.mocked(clearEvidence).mockRejectedValueOnce(new Error('down'));

      expect(await journal.clear()).toBe(false);
      expect(journal.read()).toEqual([EVIDENCE]);
    });
  });
});

// Nothing fills the journal for the player: each story activity adds its own
// evidence as it's finished, and Create Article only unlocks after all of them.
// So the activities together have to give every piece of story evidence.
describe('story evidence', () => {
  it('gives every story event at least one piece of evidence', () => {
    for (const items of Object.values(STORY_EVIDENCE)) {
      expect(items.length).toBeGreaterThan(0);
    }
  });

  it('is all given by the activities, each piece by exactly one of them', async () => {
    const given = [
      ...(await getArticleActivity()).evidenceIds,
      ...Object.values(SOCIAL_LEVELS).flatMap((level) => level.posts.flatMap((post) => post.evidenceIds)),
      ...INTERVIEW_QUESTIONS.map((question) => question.evidenceId),
    ];

    expect([...given].sort()).toEqual(ALL_STORY_EVIDENCE.map((item) => item.id).sort());
  });
});
