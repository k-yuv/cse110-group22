# Article Writing

Article Writing is the final step of a level: the player answers a set of questions using the evidence they collected, and the evidence they pick decides which ending they get. This doc explains what the screen does, where its code lives, and how it's tested.

## What it does

The screen is the page at `/create-article`, opened from the **Create Article** card on the desk (see [Desk-View.md](Desk-View.md)). It follows the "Creating Article" Figma frame and shows:

| Part of the screen | What it is |
| --- | --- |
| Open journal (left) | Every piece of evidence in the Journal, as clickable cards |
| Laptop (right) | The current question, and the evidence picked for it |
| Progress bar (top) | One slot per question, filled as questions are answered |
| Submit button (under the laptop) | **Submit answer**, or **Submit article** on the last question |

### Answering a question

The laptop shows one question at a time, for example *"What caused the fire?"*. Each question needs a set number of pieces of evidence (`requiredCount`), shown as `Evidence 1/2`.

- **Clicking a card in the journal** adds it to the current question. The card turns yellow with a ✓.
- **Clicking a picked card again** (in the journal or on the laptop) removes it.
- **Clicking a new card when the question is already full** swaps it in for one of the picked cards. Repeated swaps cycle through the slots, so you don't keep replacing the same one.

The submit button stays disabled until the question has enough evidence.

### Moving between questions

- The player only moves **forward** by pressing **Submit answer**.
- **‹ Previous question** (above the laptop) goes back to change an earlier answer. Answers are kept when going back.
- On the last question the button reads **Submit article**, which sends every answer at once.

### Journal pages

The journal holds 8 cards per open spread (4 on each page). If there's more evidence than that, **‹ Previous** and **Next ›** along the bottom of the journal turn the page.

### Endings

Submitting the article sends the answers to `submitArticle`, which returns `'good'` or `'bad'`. The screen then goes to:

| Ending | Goes to |
| --- | --- |
| Good | `/ending/good` |
| Bad | `/ending/bad` |

Both ending pages are placeholders until the real ending screens are built (issues #32 and #33).

### How the ending is decided

**The screen never decides the ending, and never knows which evidence is good.** It only gets the questions (`id`, `prompt`, `requiredCount`) and sends back which evidence ids were picked for each. This is so that, once there's a backend, players can't find the answers by looking at the frontend code.

The scoring rates each pick **against the question it answers**, so the same evidence can be strong for one question and irrelevant for another:

| Rating | Points |
| --- | --- |
| Strong | +1 |
| Weak | -1 |
| Irrelevant (or not rated) | 0 |

The points are added up over every question. A total of `GOOD_ENDING_THRESHOLD` (currently **2**) or more gives the good ending.

### Fits any window size

The layout uses the Figma frame's pixel positions (1280 × 832) and scales the whole frame to fit the window, centered. The wall and desk colors carry on past the frame's edges, so there's no empty border on wide or tall windows. The Konva stage is drawn at the scaled size, so it stays sharp.

### Mock data

There's no backend for this yet, so two things are mocked:

- **The questions, ratings and scoring** live at the bottom of `services/article.ts`, under the `MOCK` comment. When the article API exists, replace `getArticleSubjects` and `submitArticle` with `fetch` calls, and move `scoreArticle` (and its tests) to the backend.
- **The evidence in the Journal** comes from `Journal/mockEvidence.ts`, which `App.tsx` loads at startup with `seedMockEvidence()`. Remove it once the activity screens add real evidence with `JournalController.getInstance().add()`.

## Where the code is

Everything is in `frontend/src/`:

```
frontend/src/
├── App.tsx                          ← the router; sends each ending to its page
├── routes.ts                        ← the URL of every screen
├── theme.ts                         ← colors and font shared by every screen
├── services/
│   └── article.ts                   ← gets questions, submits answers (mock, includes scoring)
└── components/
    ├── Article-Writing/
    │   ├── articleWritingView.tsx   ← draws the screen (display only)
    │   ├── articleWritingModel.tsx  ← state, picking evidence, paging, submitting
    │   └── tests/
    │       ├── articleScoring.test.ts
    │       ├── articleWritingModel.test.tsx
    │       ├── articleWriting.test.tsx
    │       ├── articleWritingCanvas.test.tsx
    │       └── articleWritingFlow.test.tsx
    ├── Journal/
    │   ├── EvidenceModel.ts         ← one piece of evidence
    │   ├── JournalModel.ts          ← the list of evidence
    │   ├── JournalController.ts     ← the one shared journal (read / add / clear)
    │   ├── mockEvidence.ts          ← MOCK evidence loaded at startup
    │   └── tests/journal.test.ts
    ├── Progress-Bar/
    │   ├── ProgressBar.tsx          ← the segmented progress bar (reusable)
    │   └── tests/progressBar.test.tsx
    └── Endings/
        ├── goodEndingView.tsx       ← placeholder
        └── badEndingView.tsx        ← placeholder
```

The files depend on each other in one direction, following the [File Structure Guide](File-Structure-Guide.md):

```
articleWritingView.tsx  →  articleWritingModel.tsx  →  services/article.ts
                        →  ProgressBar.tsx          →  JournalController.ts
```

The view doesn't navigate on its own. It calls `onFinish(ending)`, and `App.tsx` decides which page that goes to.

### Which file do I open?

| I want to... | Open |
| --- | --- |
| Change the questions, ratings, or the good-ending threshold | `services/article.ts` |
| Change how picking, swapping, or submitting works | `articleWritingModel.tsx` |
| Move or resize something, or change the text on screen | `articleWritingView.tsx` (constants at the top) |
| Change a color or the font | `theme.ts` |
| Change where each ending goes | `App.tsx` (`ArticleWritingPage`) |
| Change the mock evidence | `Journal/mockEvidence.ts` |
| Connect to the real backend | `services/article.ts` |

## Using the shared pieces

### Theme

Colors and the font now live in `theme.ts` (they used to be in `Desk/deskContent.ts`). Add new colors there instead of inside a component:

```ts
import { COLORS, FONT } from '../../theme';
```

### Journal

The Journal is a single shared instance. To add evidence from your screen when the player finds it:

```ts
import { JournalController } from '../Journal/JournalController';
import { EvidenceModel } from '../Journal/EvidenceModel';

JournalController.getInstance().add(
  new EvidenceModel('ev-id', 'Title', 'One-line description', 'icon/path.png')
);
```

The evidence `id` must match the ids rated in `services/article.ts`, or it counts as irrelevant.

### Progress bar

`ProgressBar` is a plain React component (not Konva), so any screen can use it:

```tsx
<ProgressBar completed={2} total={4} label="Progress" style={{ position: 'absolute', left: 16, top: 16 }} />
```

## How it's tested

Run the tests from `frontend/` with `npm test`.

### What the tests check

| Test file | What it checks |
| --- | --- |
| `Article-Writing/tests/articleScoring.test.ts` | The scoring: all strong gives good, all weak gives bad, scores add up across questions, irrelevant and unknown evidence count as zero, evidence is rated against its own question, and unknown questions are ignored |
| `Article-Writing/tests/articleWritingModel.test.tsx` | The model on its own: loading questions, ignoring clicks with no questions, not submitting an incomplete answer, picked order, skipping evidence that's left the journal, page and question bounds, one page for an empty journal, the button disabled while sending, and resize handling |
| `Article-Writing/tests/articleWriting.test.tsx` | The screen through its hidden buttons: loading message, answered count, moving forward only by submitting, keeping answers when going back, swapping evidence once full, submitting every answer, journal paging, and both error messages |
| `Article-Writing/tests/articleWritingCanvas.test.tsx` | The Konva evidence cards: prompt and instructions on the laptop, clicking a journal card to pick it, clicking a laptop card to remove it, tap, and the pointer cursor on hover |
| `Article-Writing/tests/articleWritingFlow.test.tsx` | The whole flow with the real `App`, mock evidence and mock scoring: strong evidence ends on `/ending/good`, weak evidence on `/ending/bad` |
| `Journal/tests/journal.test.ts` | The Journal is shared, and can add, read, and clear; the mock evidence is only loaded into an empty journal, and only once |
| `Progress-Bar/tests/progressBar.test.tsx` | The bar shows its label and completed count |

### How the tests see a canvas

Our tests can't see inside a canvas (see [Konva-Testing.md](Konva-Testing.md)), so the tests use two tricks:

- **Hidden buttons.** The view renders a visually hidden list with one `<button>` per evidence card, using `aria-pressed` to show whether it's picked. They're there for screen readers, and tests click them the same way a player would:

  ```tsx
  await user.click(await screen.findByRole('button', { name: 'Evidence A' }));
  expect(screen.getByRole('button', { name: 'Evidence A' })).toHaveAttribute('aria-pressed', 'true');
  ```

- **Fake Konva.** Most test files replace `react-konva` with components that draw nothing. `articleWritingCanvas.test.tsx` instead replaces them with plain `<div>`s and `<span>`s, so it can check the cards' text and click, tap, and hover handlers.

The tests also follow the same rules as the desk tests:

- **They never hard-code the real questions or ratings.** Except for the flow test, they mock `services/article.ts` with their own small set of questions, so editing the mock data doesn't break them.
- **They reset the Journal** with `JournalController.getInstance().clear()` before each test, so evidence doesn't leak between tests.

### What the tests can't check

These depend on actually drawing the screen, so we can only check them by hand with `npm run dev` and going to `/create-article`:

- [ ] The journal, laptop, progress bar, and buttons line up with the "Creating Article" Figma frame.
- [ ] Nothing is cut off or blurry at different window sizes.
- [ ] Picked cards turn yellow with a ✓ in the journal, and appear on the laptop.
- [ ] A long question or evidence title is cut off with `…` instead of spilling out.
- [ ] The progress bar slots pop in as questions are answered.
