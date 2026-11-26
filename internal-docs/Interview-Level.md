# Interview Level

The Interview level is the third main activity in the story. The player talks to the CEO cat, chooses questions, reviews the answers, and then returns to the desk when every question is finished. This doc explains what the screen does, where its code lives, and how it's tested.

## What it does

The interview is the page at `/interview`, opened from the **Interviews** folder on the desk (see [Desk-View.md](Desk-View.md)). It is drawn with Konva and shows:

| Part of the screen | What it is |
| --- | --- |
| CEO cat | The character giving the answers |
| Question buttons | The questions still available to ask |
| Speech bubbles | The answer to the selected question and, when applicable, its selected choice |
| Advice popup | A reminder to choose one follow-up |
| **Add to Journal** | Finishes the current question and returns to the question list |
| **Finish Interview** | Appears after all questions are finished and returns to the desk |

### Asking questions

The interview copy lives in `InterviewModel.ts` and is based on the CEO coffee-chat evidence in `Journal/storyEvidence.ts`:

| Interview topic | Evidence reflected in the dialogue |
| --- | --- |
| The CEO's safety claim | The CEO says the catnip is perfectly safe, but provides no data. |
| The company's view of customers | The CEO says, "Repeat customers are good customers." |
| Pressure on the journalist | The CEO asked the journalist not to post bad claims about the company. |
| The next product | The CEO teases a "better" catnip coming soon. |

The flow is:

1. The player starts at **Let's interview the CEO of Big Drug Inc! Select a question to ask.**.
2. Selecting a question displays its answer.
3. If the question has choices, the player selects one to display its answer.
4. The player presses **Add to Journal**. The question is removed from the available list.
5. Once no questions remain, the player presses **Finish Interview**.

The model rejects question ids that are not still available and choice ids that do not belong to the selected question. Questions without follow-ups can be completed without selecting a choice.

> **Current implementation note:** `Add to Journal` currently advances the interview by removing the question, but it does not yet create an `EvidenceModel` or call `JournalController`. The label describes the intended feature; connecting the selected answer to the shared Journal is future work.

### Completing the level

Pressing **Finish Interview** calls `completeActivity('interviews')`. Progress is currently saved in browser `localStorage` through `services/progress.ts`. On success, the player is sent to `/desk`, where the Interviews folder is marked **Done!** and the Create Article activity can unlock.

If saving progress fails, the screen stays on the interview and shows **Could not save interview progress**.

### Fits any window size

The layout uses a 1280 × 832 design frame and scales it uniformly to fit the browser window, centered. The wall and desk background continue to the edges of the window. Resizing updates the scale and position.

### Animation

When a question or choice is selected, the cat bounces upward briefly. Speech bubbles animate into place when they appear.

### Not built yet

- Loading interview questions and answers from the backend.
- Adding selected answers as evidence in the shared Journal.
- Persisting interview state if the player leaves before finishing.
- A loading state for interview data.

## Where the code is

Everything is in `frontend/src/`:

```
frontend/src/
├── App.tsx                              ← registers the /interview route
├── routes.ts                            ← URL constants
├── services/
│   └── progress.ts                       ← saves completed activities (localStorage mock)
└── components/
    ├── Interview/
    │   ├── InterviewView.tsx             ← draws the Konva screen
    │   ├── interviewScreenModel.tsx      ← React state, resizing, navigation, and errors
    │   ├── InterviewModel.ts             ← question and choice state machine
    │   ├── InterviewController.ts        ← delegates screen actions to InterviewModel
    │   └── tests/
    │       ├── interviewModel.test.ts
    │       └── interviewView.test.tsx
    ├── Journal/
    │   └── JournalController.ts          ← shared journal API (not used by interview yet)
    └── Desk/
        └── deskView.tsx                  ← shows the completed/unlocked state
```

The files depend on each other in one direction, following the [File Structure Guide](File-Structure-Guide.md):

```
InterviewView.tsx
        ↓
interviewScreenModel.tsx → InterviewController.ts → InterviewModel.ts
        ↓
services/progress.ts
        ↓
routes.ts
```

### Which file do I open?

| I want to... | Open |
| --- | --- |
| Change questions, answers, or choices | `InterviewModel.ts` (`INTERVIEW_QUESTIONS`) |
| Change selection and completion rules | `InterviewModel.ts` |
| Change navigation, progress saving, or the error message | `interviewScreenModel.tsx` |
| Move, resize, or restyle the canvas elements | `InterviewView.tsx` |
| Change the cat image | `InterviewView.tsx` (`cat` import) |
| Connect interview data to the backend | Add a service, then call it from `interviewScreenModel.tsx` |
| Add answers to the Journal | `interviewScreenModel.tsx`, using `JournalController` and `EvidenceModel` |
| Change the interview URL | `routes.ts` and `App.tsx` |

## How it's tested

Run the tests from `frontend/` with `npm test`.

### What the tests check

| Test file | What it checks |
| --- | --- |
| `Interview/tests/interviewModel.test.ts` | The initial question list, valid question and choice selection, invalid selections, removing a completed question, and completing a question with no choice |
| `Interview/tests/interviewView.test.tsx` | The opening prompt, CEO questions and follow-ups, displaying selected answers, returning to the question list, saving interview progress, and navigating back to the desk |

### How the tests see the interview

The interview is drawn on a canvas, and tests cannot inspect real Konva shapes directly (see [Konva-Testing.md](Konva-Testing.md)). The view test replaces Konva components and `TitleButton` with simple DOM elements. It then clicks the same visible button labels a player uses:

```tsx
await user.click(screen.getByRole('button', {
  name: "How do you respond to concerns that Big Drug Inc.'s catnip may be unsafe?",
}));
await user.click(screen.getByRole('button', { name: 'What evidence supports that safety claim?' }));
await user.click(screen.getByRole('button', { name: 'Add to Journal' }));
```

The progress service is mocked, so the test verifies that the screen calls `completeActivity('interviews')` without writing to the real browser storage.

### What the tests can't check

These depend on the real canvas and are checked by hand with `npm run dev` at `/interview`:

- [ ] The cat, speech bubbles, advice popup, and buttons line up with the Figma frame.
- [ ] The cat bounce and speech-bubble animations look correct.
- [ ] The screen remains centered and nothing is cut off at different window sizes.
- [ ] The pointer cursor and button hover states look correct.
- [ ] The completed interview returns to the desk and shows the expected progress state.
