# MCQ Component

The MCQ component is a reusable multiple-choice question card. It loads a question from the backend, lets the player pick one of four answers, and asks the backend whether it's right. The correct answer never reaches the browser. This doc explains what it does, where its frontend and backend code live, and how it's tested.

## What it does

Drop it anywhere on a page with a chapter and question number:

```tsx
import MCQ from '../MCQ/mcqView';

<MCQ chapter={1} number={2} />
```

It draws a 360 × 300 px Konva card:

| Part | Where | What it is |
| --- | --- | --- |
| "Chapter 1 · Question 2" | Top left | Which question this is |
| Question text | Under that | The question, cut off with "…" if it's too long |
| Choices A–D | Middle | Four clickable rows |
| Result and **Reset** | Bottom | "Correct!" or "Incorrect, try again", and a button to try again |

### How it works

1. On load, the card shows "Loading question..." and fetches the question.
2. The player clicks (or taps) a choice. It turns blue while the backend checks it.
3. The backend answers:
   - **Correct:** the choice turns green and "Correct!" shows.
   - **Wrong:** the choice turns red and "Incorrect, try again" shows.
4. Once an answer is showing, other choices ignore clicks. **Reset** clears the answer so the player can pick again.

Changing the `chapter` or `number` props loads the new question and clears any previous answer.

### Errors

| What went wrong | What the player sees |
| --- | --- |
| The question couldn't be loaded | "Could not load question" |
| The answer couldn't be checked | "Could not check answer". The choice is unselected so the player can click again. |

### Why the backend checks the answer

The frontend only ever gets the question and its four choices. The answer is sent to the backend as a position (0–3), and the backend replies with `{ correct: true }` or `{ correct: false }`. This way the answer can't be found by looking at network requests or the page's code.

### Not built here

The component isn't placed on any game screen yet. Each chapter that needs a question adds `<MCQ ... />` itself.

## The backend API

Both routes are defined in `backend/openapi.yaml`. Every request and response is checked against it before reaching the code, so bad input is rejected automatically.

| Method and URL | Body | Response |
| --- | --- | --- |
| `GET /api/chapters/:chapter/questions/:number` | none | `{ chapter, number, content, choices }` |
| `POST /api/chapters/:chapter/questions/:number/answers` | `{ "choice": 0-3 }` | `{ correct: boolean }` |

| Status | When |
| --- | --- |
| 200 | Success |
| 400 | `chapter` or `number` isn't a positive whole number, `choice` isn't a whole number from 0 to 3, or the body has extra fields |
| 404 | No question has that chapter and number |
| 405 | Wrong method (for example `GET` on `/answers`) |
| 415 | `POST` with no JSON body |
| 500 | `questions.json` can't be read, or a saved question breaks the schema (not exactly 4 choices, an empty choice, no content) |

### Where questions are stored

Questions live in `backend/data/questions.json`. A fresh clone gets the sample questions from `backend/seed/questions.json` copied in the first time the server starts (see `utils/seed.ts`). Each saved question looks like:

```json
{
  "chapter": 1,
  "number": 1,
  "content": "Sample question: what is 2 + 2?",
  "choices": ["3", "4", "5", "22"],
  "correctChoice": 1
}
```

`correctChoice` is the position in `choices` of the right answer. The service removes it before sending a question to the frontend.

## Where the code is

```
frontend/src/
├── services/
│   └── questions.ts                    ← getQuestion() and submitAnswer(), the fetch calls
└── components/MCQ/
    ├── mcqView.tsx                     ← draws the card (display only)
    ├── mcqModel.tsx                    ← state, loading, choosing, reset
    └── tests/
        └── mcq.test.tsx

backend/
├── openapi.yaml                        ← the two routes and the Question, NewAnswer, AnswerResult schemas
├── seed/
│   └── questions.json                  ← sample questions copied into data/ on first run
└── src/
    ├── app.ts                          ← Question, StoredQuestion, AnswerResult types; mounts the router
    └── features/questions/
        ├── questions.router.ts         ← maps URLs to controller functions
        ├── questions.controller.ts     ← reads params, picks 200 or 404
        ├── questions.service.ts        ← finds the question, hides correctChoice, checks the answer
        └── tests/
            ├── questions.test.ts
            └── answers.test.ts
```

The files depend on each other in one direction, following the [File Structure Guide](File-Structure-Guide.md):

```
mcqView.tsx  →  mcqModel.tsx  →  services/questions.ts  →  (HTTP)  →  questions.router.ts
                                                                   →  questions.controller.ts
                                                                   →  questions.service.ts
                                                                   →  utils/jsonStore.ts
```

In development, Vite forwards `/api` requests to the backend on port 3000 (see `frontend/vite.config.ts`).

### Which file do I open?

| I want to... | Open |
| --- | --- |
| Add or change a question | `backend/seed/questions.json` for the defaults, or `backend/data/questions.json` for your local copy |
| Change the card's size, colors, or layout | `mcqView.tsx` |
| Change what happens when a choice is clicked or Reset is pressed | `mcqModel.tsx` |
| Change the result or error messages | `mcqView.tsx` (results) and `mcqModel.tsx` (errors) |
| Change how an answer is checked | `backend/src/features/questions/questions.service.ts` |
| Change what the API accepts or returns | `backend/openapi.yaml`, then the types in `app.ts` and `services/questions.ts` |

### Writing questions

- Every question needs **exactly 4 non-empty choices**, or the backend responds with 500 instead of sending it.
- `chapter` and `number` together must be unique, and both start at 1.
- `correctChoice` counts from 0, so `1` means the second choice (B).
- Keep the question under about two lines and each choice to one line. The card cuts off anything longer with "…".
- `seed/questions.json` is only copied when `data/questions.json` is missing or empty. To see seed changes locally, delete `data/questions.json` and restart the server.

## How it's tested

Run the frontend tests from `frontend/` and the backend tests from `backend/`, each with `npm test`.

| Test file | What it checks |
| --- | --- |
| `frontend/.../MCQ/tests/mcq.test.tsx` | The loading message. The chapter label, question, and lettered choices. A correct answer turns green and a wrong one red. Other choices are ignored once an answer shows. Reset allows another try. Load and check errors, and trying again after a check error. New props load a new question and clear the answer. |
| `backend/.../questions/tests/questions.test.ts` | `GET` returns the right question **without `correctChoice`**. 404 for a missing question or missing file. 400 for bad params. 500 for an unreadable file or a saved question that breaks the schema. |
| `backend/.../questions/tests/answers.test.ts` | The correct choice returns `true` and the others `false`, against the right question. The file isn't changed. 404s, 400s for bad params and bad `choice` values, 405, 415, and 500. |

The frontend test mocks `services/questions.ts`, so it doesn't need the backend running. It also swaps each Konva shape for plain HTML so it can read text and click choices (see [Konva-Testing.md](Konva-Testing.md)). Each choice's `Rect` has a `name` like `choice-1`, which the test uses to check its color.

The backend tests use supertest and read from `backend/data/test/` (set by `DATA_DIR` in `vitest.config.mts`), so they never touch real data.

### What the tests can't check

Check these by hand with both servers running (`npm run dev` in `backend/` and `frontend/`):

- [ ] Long questions and choices are cut off cleanly and don't overlap other rows.
- [ ] Choices respond to clicks with a mouse and taps on a touch screen.
- [ ] The card looks right on the screen it's placed on.

### Known limitations

- The card is a fixed 360 × 300 px and doesn't resize with the window.
- Hovering a choice doesn't change the cursor or highlight it.
- It always shows exactly 4 choices, lettered A–D.
