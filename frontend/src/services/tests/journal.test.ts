import { describe, it, expect, beforeEach } from 'vitest';
import { addEvidence, clearEvidence, getEvidence, STORAGE_KEY, type Evidence } from '../journal';

const EVIDENCE: Evidence = { id: 'a', toolName: 'Evidence A', toolDescription: 'About A', iconPath: 'a.png' };

describe('journal service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty', async () => {
    expect(await getEvidence()).toEqual([]);
  });

  it('saves added evidence so it can be read back', async () => {
    expect(await addEvidence(EVIDENCE)).toEqual([EVIDENCE]);
    expect(await getEvidence()).toEqual([EVIDENCE]);
  });

  it('does not save the same id twice', async () => {
    await addEvidence(EVIDENCE);

    expect(await addEvidence({ ...EVIDENCE, toolName: 'Changed' })).toEqual([EVIDENCE]);
    expect(await getEvidence()).toEqual([EVIDENCE]);
  });

  it('clears saved evidence', async () => {
    await addEvidence(EVIDENCE);

    await clearEvidence();

    expect(await getEvidence()).toEqual([]);
  });

  it('reads saved data that is not valid JSON as empty', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json');

    expect(await getEvidence()).toEqual([]);
  });

  it('reads saved data that is not a list as empty', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 'a' }));

    expect(await getEvidence()).toEqual([]);
  });

  it('skips saved entries with the wrong shape', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([EVIDENCE, null, { id: 'b' }, 'c']));

    expect(await getEvidence()).toEqual([EVIDENCE]);
  });
});
