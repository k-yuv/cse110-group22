# Journal

The player's evidence notebook (issue #36). There's one shared store of evidence, and a docked and a full two-page view that both draw from it. This doc explains how to use it, where its code lives, and how it's tested.

**So far it's only on the desk.** To add it to an activity screen, see [Showing it on a screen](#showing-it-on-a-screen).

## Using it

### Showing it on a screen

Add one line next to the screen's `<Stage>`, inside its `<main>`:

```tsx
import Journal from '../Journal/journalView';

<Journal placement="desk" />
```

It looks after itself: it has its own small canvas on top of the screen, knows when it's open, and updates when evidence changes.

| `placement` | Where | Note says |
| --- | --- | --- |
| `desk` | Bottom middle, running off the window ([Central View frame](https://www.figma.com/design/bgVtm8bS5bJKMasBZrqcJA/CSE110-Mockups?node-id=100-3)) | Evidence |
| `corner` | Bottom left, tilted (`Journal-Corner-View.png`) | Journal |

When you add it to a screen, check that screen's tests: if they replace `react-konva` with fakes, the fakes also need `Line`.

### Adding and reading evidence

```ts
import { JournalController } from '../Journal/JournalController';
import { EvidenceModel } from '../Journal/EvidenceModel';

const journal = JournalController.getInstance();

const saved = await journal.add(new EvidenceModel('ev-id', 'Title', 'One-line description', 'icon/path.png'));
journal.read();              // the evidence, oldest first
journal.subscribe(listener); // returns a function that stops listening
await journal.clear();
```

- `add` ignores an id the journal already has, so replaying an activity is safe.
- `add` shows evidence right away, then saves it. It resolves to `false` if saving failed, and the evidence is removed again. Check this if the player would otherwise lose the evidence, as `newsArticleModel.tsx` does.
- The evidence `id` must match the ids rated in `services/article.ts`, or it counts as irrelevant.

### What the player sees

- **Docked:** the closed book with its sticky note, as in the Figma frame. It doesn't show any evidence. Clicking it opens the full journal.
- **Open:** the two-page book with up to 6 notes (3 a page). It opens on the newest evidence. **‹ Previous** and **Next ›** turn the pages, and **Close** or Escape closes it.

### Mocks and placeholders

- **Saving:** `services/journal.ts` is a mock API that saves to localStorage. It's async like a real request, so connecting a backend route only changes its three functions.
- **Evidence:** `App.tsx` loads the saved evidence, then `mockEvidence.ts` fills an empty journal with 19 fake entries, which get saved too. Article Writing can't reach the good ending without them, because `services/article.ts` only rates their `ev-*` ids. Remove the seed once real activities supply enough evidence.
- **Icons:** `iconPath` is stored but not drawn. Nothing has an icon yet.

## Where the code is

```
frontend/src/
├── App.tsx                      ← waits for the journal to load before showing any screen
├── helpers.ts                   ← visuallyHidden and paginate, shared with other screens
├── services/
│   └── journal.ts               ← mock API: getEvidence, addEvidence, clearEvidence
└── components/Journal/
    ├── EvidenceModel.ts         ← one piece of evidence
    ├── JournalModel.ts          ← the list of evidence
    ├── JournalController.ts     ← the one shared journal, kept in memory and saved through the service
    ├── mockEvidence.ts          ← MOCK evidence loaded at startup
    ├── journalView.tsx          ← <Journal />: the docked and open journal together (display only)
    ├── journalViewModel.tsx     ← open/closed, page, window size; useJournalLoader for App
    ├── journalRules.ts          ← dockBounds (plain function, no React)
    ├── journalContent.ts        ← labels, and where each part sits
    └── parts/
        ├── JournalBook.tsx      ← the drawn book: the dock, the overlay and Article Writing all use it
        ├── JournalDock.tsx      ← the docked journal
        └── JournalOverlay.tsx   ← the full two-page journal
```

The hook file is `journalViewModel.tsx` rather than the usual `journalModel.tsx`, which would clash with `JournalModel.ts` on a case-insensitive disk.

### Which file do I open?

| I want to... | Open |
| --- | --- |
| Connect a real backend route | `services/journal.ts` |
| Change how many notes fit, or move something | `journalContent.ts` |
| Change how a note looks | `parts/JournalOverlay.tsx` |
| Change how the docked book looks | `parts/JournalDock.tsx` |
| Change the mock evidence | `mockEvidence.ts` |
| Change the book's cover or pages (every screen) | `parts/JournalBook.tsx` |

## How it's tested

Run the tests from `frontend/` with `npm test`.

| Test file | What it checks |
| --- | --- |
| `services/tests/journal.test.ts` | Saving, reading, clearing, no duplicate ids, and corrupt or wrongly shaped saved data |
| `Journal/tests/journal.test.ts` | Add, read and clear. De-duplicating. Listeners. Coming back after a reload. Loading once and retrying. Undoing a change when saving fails. The mock seed. |
| `tests/helpers.test.ts` | Pagination at the page boundary |
| `Journal/tests/journalRules.test.ts` | The docked canvas's size |
| `Journal/tests/journalView.test.tsx` | Opening, the open journal updating live, Close and Escape, turning pages and stopping at each end |
| `Journal/tests/journalFlow.test.tsx` | Integration: pass Online Articles, open the journal from the desk, reload, and still see the evidence. Replaying and reloading add no duplicates. A failed load shows an error and can be retried. |

Tests can't see inside the canvas (see [Konva-Testing.md](Konva-Testing.md)), so the view keeps hidden HTML lists of what it draws. A "reload" in tests drops the in-memory journal with `JournalController.resetInstance()` and renders again, because jsdom can't really reload.

### What the tests can't check

Check these by hand with `npm run dev`, on each screen that shows `<Journal />`:

- [ ] The docked journal and open journal match their Figma frames.
- [ ] The docked journal doesn't cover anything the player needs to click.
- [ ] The longest evidence text fits its note.
- [ ] Evidence is still there after a real page reload.
