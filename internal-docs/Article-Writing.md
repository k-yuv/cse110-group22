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

Submitting the article sends every answer to the backend in one request (`submitArticle` → `POST /api/article/answers`), which responds with `'good'` or `'bad'`. The screen then goes to:

| Ending | Goes to |
| --- | --- |
| Good | `/ending/good` |
| Bad | `/ending/bad` |

Both ending pages are placeholders until the real ending screens are built (issues #32 and #33).

`/create-article` only opens once Interviews is done, and the endings only open right after submitting an article. `ArticleWritingPage` passes `{ articleSubmitted: true }` as router state for that, so typing an ending's URL sends the player to the desk. See [Route-Guard.md](Route-Guard.md).

### How the ending is decided

**The screen never decides the ending, and never knows which evidence is good.** It only gets the questions (`id`, `prompt`, `requiredCount`) and sends back which evidence ids were picked for each. The ratings and the scoring live only on the backend, so players can't find the answers by looking at the frontend code or network requests.

The request and response look like this:

```
POST /api/article/answers
{ "answers": { "subject-quitting": ["ev-avogato-post", "ev-withdrawal-posts"], "subject-ingredient": ["ev-nicotine"], ... } }

→ 200 { "ending": "good" }
```

| Response | When |
| --- | --- |
| `200` `{ "ending": "good" \| "bad" }` | Always, for a well-formed request. Unknown question or evidence ids just score 0. |
| `400` | `answers` is missing, or isn't an object of string lists, or the body has extra fields |
| `500` | The ratings file can't be read |

The backend scores each pick **against the question it answers**, so the same evidence can be strong for one question and irrelevant for another:

| Rating | Points |
| --- | --- |
| Strong | +1 |
| Weak | -1 |
| Irrelevant (or not rated) | 0 |

The points are added up over every question. The good ending needs a total of at least `GOOD_ENDING_SHARE` (currently **0.5**, in `backend/src/features/article/article.service.ts`) times the number of evidence picks. Each article asks a random set of questions, so it has 5 to 10 picks; with 8 picks, 6 strong and 2 weak is good, and 5 strong and 3 weak is bad. An empty article is always bad. The response only says the ending, never the score or the ratings.

### The ratings "table"

The ratings are stored like a tiny database table: one row per question, saying how each piece of evidence rates for it.

| What | Where | Committed to git? |
| --- | --- | --- |
| Starter copy | `backend/seed/articleRatings.json` | Yes |
| The copy the backend reads | `backend/data/articleRatings.json` | No. It's copied from `seed/` when the backend starts (see [Bare-Essentials.md](Bare-Essentials.md#starter-data-backendseed)). |

```json
{
  "subjectId": "subject-ingredient",
  "ratings": { "ev-nicotine": "strong", "ev-ceo-pr-claims": "weak", ... }
}
```

- `subjectId` must match a question `id` in `frontend/src/services/article.ts`.
- Each key in `ratings` must match an evidence id in the Journal (`Journal/storyEvidence.ts`). Evidence that isn't listed counts as irrelevant.
- `services/tests/articleQuestionBank.test.ts` fails if these get out of sync, or if a question can't be fully answered with strong evidence.

**To change a rating:** edit `backend/seed/articleRatings.json`, then stop the backend, delete `backend/data/articleRatings.json`, and start it again. Seeding never overwrites a data file that already has something in it.

### Fits any window size

The layout uses the Figma frame's pixel positions (1280 × 832) and scales the whole frame to fit the window, centered. The wall and desk colors carry on past the frame's edges, so there's no empty border on wide or tall windows. The Konva stage is drawn at the scaled size, so it stays sharp.

### Mock data

Scoring is real (on the backend), and the questions and evidence are the real story content, but some of it is still wired up temporarily:

- **The questions** live at the bottom of `services/article.ts`, under the `MOCK` comment, until there is a backend route for them. The bank has 11, in 5 sections (`ARTICLE_SECTIONS`), which together argue that cats are addicted to Big Drug Inc.'s catnip, the company knows it, and it hides it. Each time the page loads, `pickArticleSubjects()` asks one random question from each section, in order, so an article has at most `MAX_ARTICLE_QUESTIONS` (5) questions.
- **The evidence in the Journal** is listed in `Journal/storyEvidence.ts`, grouped by the story event that gives it (`STORY_EVIDENCE`, matching the E1–E7 badges on Figma's Page Story). For now `seedStoryEvidence()` puts all of it into an empty journal at once. Once each activity screen adds its own `STORY_EVIDENCE[event]` when the player finds it, remove the seeding. Evidence from Online Articles appears here too, but its ids aren't rated yet, so it counts as irrelevant.
- **A journal saved before this change** still holds the old fire evidence, since seeding only fills an empty journal. Use the desk's reset button, or clear the `journal` key in localStorage.

## Where the code is

The screen is in `frontend/src/`:

```
frontend/src/
├── App.tsx                          ← the router; sends each ending to its page
├── routes.ts                        ← the URL of every screen
├── theme.ts                         ← colors and font shared by every screen
├── services/
│   ├── article.ts                   ← submits answers to the backend; mock questions
│   └── tests/article.test.ts
└── components/
    ├── Article-Writing/
    │   ├── articleWritingView.tsx   ← draws the screen (display only)
    │   ├── articleWritingModel.tsx  ← state, picking evidence, paging, submitting
    │   └── tests/
    │       ├── articleWritingModel.test.tsx
    │       ├── articleWriting.test.tsx
    │       ├── articleWritingCanvas.test.tsx
    │       └── articleWritingFlow.test.tsx
    ├── Journal/                     ← the shared evidence store: see Journal.md
    ├── Progress-Bar/
    │   ├── ProgressBar.tsx          ← the segmented progress bar (reusable)
    │   └── tests/progressBar.test.tsx
    └── Endings/
        ├── goodEndingView.tsx       ← placeholder
        └── badEndingView.tsx        ← placeholder
```

The scoring is in `backend/`:

```
backend/
├── openapi.yaml                     ← POST /api/article/answers and its schemas
├── seed/
│   └── articleRatings.json          ← the ratings "table" (starter copy)
└── src/
    ├── app.ts                       ← StoredSubjectRatings / ArticleAnswers / ArticleResult types, mounts the router
    └── features/article/
        ├── article.router.ts        ← maps the URL to the controller
        ├── article.controller.ts    ← reads the request, sends the ending
        ├── article.service.ts       ← reads the ratings, scores, picks the ending
        └── tests/article.test.ts
```

The files depend on each other in one direction, following the [File Structure Guide](File-Structure-Guide.md):

```
articleWritingView.tsx  →  articleWritingModel.tsx  →  services/article.ts  ⇢  POST /api/article/answers
                        →  ProgressBar.tsx          →  JournalController.ts
                        →  Journal/parts/JournalBook.tsx

article.router.ts  →  article.controller.ts  →  article.service.ts  →  utils/jsonStore.ts
```

The view doesn't navigate on its own. It calls `onFinish(ending)`, and `App.tsx` decides which page that goes to. Likewise, the back arrow in the top left asks "Are You Sure?" first, then calls `onBack()`, which `App.tsx` sends to the desk. See [Back-Confirmation.md](Back-Confirmation.md).

### Which file do I open?

| I want to... | Open |
| --- | --- |
| Change the questions | `services/article.ts` (`ARTICLE_SECTIONS`), and keep `backend/seed/articleRatings.json` in sync |
| Change how many questions are asked, or how they're picked | `services/article.ts` (`MAX_ARTICLE_QUESTIONS`, `pickArticleSubjects`) |
| Change how evidence is rated | `backend/seed/articleRatings.json` (see [The ratings "table"](#the-ratings-table)) |
| Change the points or the good-ending share | `backend/src/features/article/article.service.ts` |
| Change what the route accepts or returns | `backend/openapi.yaml` first, then the types in `backend/src/app.ts` |
| Change how picking, swapping, or submitting works | `articleWritingModel.tsx` |
| Move or resize something, or change the text on screen | `articleWritingView.tsx` (constants at the top) |
| Change a color or the font | `theme.ts` |
| Change how the journal book itself looks | `Journal/parts/JournalBook.tsx` (shared with the Journal screen) |
| Change where each ending goes | `App.tsx` (`ArticleWritingPage`) |
| Change the evidence | `Journal/storyEvidence.ts`, and keep `backend/seed/articleRatings.json` in sync |
| Change how the frontend calls the backend | `services/article.ts` (`submitArticle`) |

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

The evidence `id` must match the ids rated in `backend/seed/articleRatings.json`, or it counts as irrelevant.

### Progress bar

`ProgressBar` is a plain React component (not Konva), so any screen can use it:

```tsx
<ProgressBar completed={2} total={4} label="Progress" style={{ position: 'absolute', left: 16, top: 16 }} />
```

## How it's tested

Run the tests with `npm test`, from `frontend/` for the screen and from `backend/` for the scoring.

### What the tests check

| Test file | What it checks |
| --- | --- |
| `backend/src/features/article/tests/article.test.ts` | **The scoring:** strong is +1, weak is -1, scores add up across questions, irrelevant and unknown evidence count as zero, evidence is rated against its own question, unknown questions are ignored. **The ending:** good once the score reaches half the picks, bad for an empty article. **The route:** good and bad endings, exactly at and just below half the picks, no answers, only `ending` is sent back, the ratings file isn't changed, and the `400` / `405` / `415` / `500` cases. **The seed file:** the strong and weak picks used by the flow test give the good and bad endings, and mixing in too many weak picks gives the bad ending. |
| `services/tests/article.test.ts` | `submitArticle` posts every answer to `/api/article/answers` and returns the ending, and throws on an error response. The mock questions have the right shape. |
| `services/tests/articleQuestionBank.test.ts` | The questions, the Journal evidence and `backend/seed/articleRatings.json` agree: every question is rated, only collectable evidence is rated, every question has enough strong answers and at least one weak one. Each article asks at most 5 questions, one per section in order, and every question in the bank can come up |
| `Article-Writing/tests/articleWritingModel.test.tsx` | The model on its own: loading questions, ignoring clicks with no questions, not submitting an incomplete answer, picked order, skipping evidence that's left the journal, page and question bounds, one page for an empty journal, the button disabled while sending, and resize handling |
| `Article-Writing/tests/articleWriting.test.tsx` | The screen through its hidden buttons: loading message, answered count, moving forward only by submitting, keeping answers when going back, swapping evidence once full, submitting every answer, journal paging, and both error messages |
| `Article-Writing/tests/articleWritingCanvas.test.tsx` | The Konva evidence cards: prompt and instructions on the laptop, clicking a journal card to pick it, clicking a laptop card to remove it, tap, and the pointer cursor on hover |
| `Article-Writing/tests/articleWritingFlow.test.tsx` | The whole flow with the real `App`, the story evidence and questions (with `Math.random` fixed so the same 5 come up), and mock scoring (turning journal pages to find each card): strong evidence ends on `/ending/good`, weak evidence on `/ending/bad`. Each test marks the story activities done first, since Create Article is guarded |
| `Journal/tests/journal.test.ts` | The Journal is shared, and can add, read, and clear; every piece of story evidence is loaded into an empty journal, only once, and every story event has evidence |
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

- **They never hard-code the real questions or ratings.** Except for the flow test, they mock `services/article.ts` with their own small set of questions, so editing the mock data doesn't break them. The backend route tests use their own small ratings file too. Only the seed-file check reads the real ratings.
- **They reset the Journal** with `JournalController.getInstance().clear()` before each test, so evidence doesn't leak between tests.

### What the tests can't check

These depend on actually drawing the screen, so we can only check them by hand with `npm run dev` (from the repo root, so the backend runs too) and going to `/create-article`:

- [ ] Strong evidence (e.g. Fire marshal report, Security camera footage, Inspection records, then Fire marshal report + Foreman interview) ends on the good ending, and weak evidence on the bad one.
- [ ] With the backend stopped, **Submit article** shows "Could not submit article".
- [ ] The journal, laptop, progress bar, and buttons line up with the "Creating Article" Figma frame.
- [ ] Nothing is cut off or blurry at different window sizes.
- [ ] Picked cards turn yellow with a ✓ in the journal, and appear on the laptop.
- [ ] A long question or evidence title is cut off with `…` instead of spilling out.
- [ ] The progress bar slots pop in as questions are answered.
