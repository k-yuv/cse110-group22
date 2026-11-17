# Online Articles

The first story activity (issue #28). The player compares a newspaper article to a trusted transcript and highlights the sentences that are misinformation. This doc explains what it does, where its code lives, and how it's tested.

## What it does

The screen is the page at `/online-article`, opened from the **Online Articles** folder on the desk. It's drawn with Konva and matches the [Online News Articles Figma frame](https://www.figma.com/design/bgVtm8bS5bJKMasBZrqcJA/CSE110-Mockups?node-id=132-3):

| Part | Where | What it is |
| --- | --- | --- |
| "TO DO: highlight misinformation" | Top middle | The player's goal (HTML, not canvas) |
| Trusted transcript | Left card | What was really said. Everything in it is true. |
| Newspaper | Right | "THE SOCIETY / BREAKING NEWS", with one sentence per row in its text column |
| Highlighter | Bottom center | Click to pick it up or put it back |
| Submit / result / Continue | Bottom right | HTML buttons and the pass or fail message |

### How to play

1. Click the highlighter to pick it up. It follows the mouse, with its tip on the pointer, and a dark outline stays where it was.
2. Click a sentence to highlight it yellow. Click it again to remove the highlight. Without the highlighter, sentences show a "not allowed" cursor and ignore clicks.
3. Click the outline to put the highlighter back.
4. Click **Submit**.
   - **Fail:** a message says how many false sentences were found, and whether any true ones were highlighted, without saying which. The highlights stay so the player can fix them. Changing a highlight clears the message.
   - **Pass:** every false sentence and nothing else is highlighted. The evidence goes to the Journal, `articles` is marked done, the sentences lock, and the highlighter is put away. **Continue** returns to the desk, which shows Done! and unlocks Social Media Posts.

### Grading

Sentences are graded as whole sentences, by id. The player passes only with **no missed and no extra** highlights, so highlighting the whole article doesn't work.

| Highlighted (answers are s2 and s4) | Result |
| --- | --- |
| s2, s4 | Pass |
| s2 | Fail: 1 missed |
| s2, s4, s1 | Fail: 1 extra |
| Nothing | Fail: 2 missed |

### Mocks and placeholders

- **Article content:** `services/articles.ts` returns a placeholder Big Drug Inc. catnip story from `getArticleActivity()`. It's async like a real request, so connecting a backend route only changes that function.
- **Journal:** `journalAdapter.ts` collects the evidence in a list until the Journal (#36, on `feature/article-writing`) is merged. Then only `addEvidence` changes, to call `JournalController.getInstance().add(...)`.
- **Progress:** uses the real (mock) `services/progress.ts`, like the desk.

### Not built here

The settings and hint buttons and the docked Journal are shared components owned by other issues. The back button and its "Are You Sure?" popup are shared too; see [Back-Confirmation.md](Back-Confirmation.md).

## Where the code is

Everything is in `frontend/src/`:

```
frontend/src/
├── services/
│   └── articles.ts                 ← data shapes, mock content, getArticleActivity()
├── assets/
│   ├── Newspaper-Template-2.png    ← the newspaper
│   ├── Highlighter.png             ← the highlighter
│   └── Highlighter-Outline.png     ← black silhouette of it, drawn faintly while it's held
└── components/NewsArticle/
    ├── newsArticleView.tsx         ← draws the screen (display only)
    ├── newsArticleModel.tsx        ← state, loading, highlighter, submit
    ├── newsArticleRules.ts         ← toggling, grading, result message (plain functions, no React)
    ├── newsArticleContent.ts       ← labels, colors, and where each part sits
    ├── journalAdapter.ts           ← TODO: stand-in for the Journal
    └── tests/
        ├── newsArticleRules.test.ts
        ├── newsArticleModel.test.tsx
        └── newsArticle.test.tsx
```

The files depend on each other in one direction, following the [File Structure Guide](File-Structure-Guide.md):

```
newsArticleView.tsx  →  newsArticleModel.tsx  →  newsArticleRules.ts
                                              →  services/articles.ts
                                              →  services/progress.ts
                                              →  journalAdapter.ts
                                              →  routes.ts (to navigate)
```

The view also reuses `Desk/parts/HoverSpotlight.tsx` for the glow-and-grow hover on sentences and the highlighter.

### Which file do I open?

| I want to... | Open |
| --- | --- |
| Change the story, the transcript, or which sentences are false | `services/articles.ts` (`MOCK_ACTIVITY`) |
| Connect to a real backend route | `services/articles.ts` (`getArticleActivity`) |
| Connect the real Journal | `journalAdapter.ts` |
| Change the pass rule or the result message | `newsArticleRules.ts` |
| Change what happens on submit or Continue | `newsArticleModel.tsx` |
| Move or resize something, or change a color or label | `newsArticleContent.ts` |
| Fit the sentences to a different newspaper image | `ARTICLE_COLUMN` and `NEWSPAPER_LAYOUT` in `newsArticleContent.ts` |
| Line the highlighter's tip up with the pointer | `HIGHLIGHTER_TIP` in `newsArticleContent.ts` |

### Writing article content

- The newspaper's text column is small, so keep the article to **4–5 short sentences**. Each sentence gets an equal-height row.
- Each false claim must be its own sentence, since the player highlights whole sentences.
- Every `answerKey` entry's `segmentId` must match a sentence's `id`, and its `evidence` is what goes into the Journal.

## How it's tested

Run the tests from `frontend/` with `npm test`.

| Test file | What it checks |
| --- | --- |
| `newsArticleRules.test.ts` | Grading for exact, partial, extra, and empty highlights. Toggling a highlight on and off without changing the original array. The pass and fail messages. |
| `newsArticleModel.test.tsx` | Loading and a load error. Picking up and putting down the highlighter. Clicks ignored without it. Highlighting and removing a highlight. A fail keeps the highlights and saves nothing. Changing a highlight clears the result. **A pass hands each piece of evidence to the Journal and saves progress.** The highlighter is put away and sentences lock after a pass. A save error. Resizing. Continue goes to the desk. |
| `newsArticle.test.tsx` | The to-do heading, the fail message after submitting with nothing highlighted, the load error, and the back button asking before leaving. |

Like the desk, the tests can't see inside the canvas (see [Konva-Testing.md](Konva-Testing.md)), so they run `useNewsArticleModel()` directly with `renderHook`. Sentence ids and answers come from the loaded article instead of being typed out, so changing the story doesn't break the tests. Until the Journal is merged, the tests mock `journalAdapter` and check what the model hands to it.

### What the tests can't check

These depend on drawing the screen, so check them by hand with `npm run dev`:

- [ ] The sentences fit inside the newspaper's blank column at different window sizes.
- [ ] Hovering a sentence or the highlighter makes it glow and grow. Sentences show "not allowed" without the highlighter.
- [ ] The held highlighter follows the mouse with its tip on the pointer, and no other cursor shows.
- [ ] The dark outline shows while the highlighter is held, and clicking it puts the highlighter back.
- [ ] Clicked sentences turn yellow, and clicking again clears them.
- [ ] After a pass, the highlighter and outline disappear, and Continue leads to a desk with Online Articles done.

### Known limitations

- On touch screens the held highlighter doesn't follow the finger (there's no mouse movement), but tapping sentences still works.
- `Newspaper-Template-2.png` is only 494 × 619 px, so it may look soft on large screens.
