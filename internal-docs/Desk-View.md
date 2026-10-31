# Desk View

The desk is the hub screen the player returns to between activities (issue #25). This doc explains what it does, where its code lives, and how it's tested.

## What it does

The desk is the page at `/`. It's drawn with Konva and shows six things the player can click:

| Item on the desk | What it is | Goes to |
| --- | --- | --- |
| Online Articles folder | Main activity 1 | `/online-article` |
| Social Media Posts folder | Main activity 2 | `/social-media` |
| Interviews folder | Main activity 3 | `/interview` |
| AI Images picture | Minigame | `/ai-image` |
| "TO DO: clean desk!" sticky note | Minigame | `/clean-desk` |
| Create Article card | The final step | `/create-article` |

None of those screens exist yet, so each URL shows the 404 page for now.

### Locked and unlocked

The main activities unlock **in story order**: each one needs the one before it done.

| Item | Unlocks when |
| --- | --- |
| Online Articles | Always open |
| Social Media Posts | Online Articles is done |
| Interviews | Social Media Posts is done |
| Create Article | Interviews is done |
| Both minigames | Always open (they're side activities) |

A locked item has a **"Must gather more evidence"** sticky note on it. Clicking it does nothing, and hovering it shows a "not allowed" cursor.

### Done! notes

A finished activity gets a pink **"Done!"** sticky note. This matches the progress states in the [Central View Figma frames](https://www.figma.com/design/bgVtm8bS5bJKMasBZrqcJA/CSE110-Mockups?node-id=100-3).

### Hover effect

Hovering any unlocked item makes it grow slightly, with a soft light behind it. This comes from the `HoverSpotlight` component.

### Fits any window size

Every position and size on the desk is a **fraction of the window**, not a pixel value, so the desk fills the screen at any size. For example, `x: 0.23, y: 0.36` means "23% across, 36% down". On a very wide, short window, items size themselves by the height instead, so nothing gets cut off.

### Progress

Which activities are done is saved in the browser (`localStorage`), so it survives a page refresh. This is a **mock**: there's no backend route for progress yet. When there is, only `services/progress.ts` needs to change.

### Temporary dev buttons

When you run the app with `npm run dev`, two buttons appear in the bottom left:

- **Dev: complete next level** marks the next main activity done, in story order.
- **Dev: reset progress** clears all progress.

They exist only so you can try out the desk before the activity screens are built, and they never appear in production builds. Remove them (search for `TEMPORARY`) once the activities can actually be played.

### Not built yet

- The docked Journal (issue #36).
- The settings and help buttons from the mockup (issues #37 and #24).

## Where the code is

Everything is in `frontend/src/`:

```
frontend/src/
├── App.tsx                         ← the router: which URL shows which screen
├── routes.ts                       ← the URL of every screen
├── services/
│   ├── progress.ts                 ← saves and loads progress (mock, uses localStorage)
│   └── tests/progress.test.ts
└── components/
    ├── Not-Found/
    │   └── notFoundView.tsx        ← the 404 page
    └── Desk/
        ├── deskView.tsx            ← draws the desk (display only)
        ├── deskModel.tsx           ← state, loading progress, what happens on click
        ├── deskRules.ts            ← the unlock rules (plain functions, no React)
        ├── deskContent.ts          ← labels, colors, and where each item sits
        ├── parts/
        │   ├── DeskItem.tsx        ← wrapper for anything clickable on the desk
        │   ├── HoverSpotlight.tsx  ← the hover grow-and-glow effect
        │   ├── Folder.tsx          ← a manila folder (the three main activities)
        │   ├── MinigameEntry.tsx   ← the AI Images picture and the clean desk note
        │   ├── CreateArticleButton.tsx
        │   └── StickyNote.tsx      ← the Done! and locked notes
        └── tests/
            ├── deskRules.test.ts
            └── deskModel.test.tsx
```

The files depend on each other in one direction, following the [File Structure Guide](File-Structure-Guide.md):

```
deskView.tsx  →  deskModel.tsx  →  deskRules.ts
                               →  services/progress.ts
                               →  routes.ts (to navigate)
```

### Which file do I open?

| I want to... | Open |
| --- | --- |
| Move an item, resize it, or change a color or label | `deskContent.ts` |
| Change the unlock order or rules | `deskRules.ts` (`STORY_ORDER`) |
| Change what happens when something is clicked | `deskModel.tsx` |
| Change how an item looks | the matching file in `parts/` |
| Change the hover effect | `parts/HoverSpotlight.tsx` |
| Add or rename a URL | `routes.ts`, then `App.tsx` |
| Connect progress to the real backend | `services/progress.ts` |

## Hooking up your screen

When you build one of the activity screens:

1. **Add a route** in `App.tsx`, using the path that's already in `routes.ts`, above the `"*"` route:

   ```tsx
   <Route path={ROUTES.onlineArticle} element={<OnlineArticles />} />
   ```

2. **Mark the activity done** when the player finishes it, by calling `completeActivity` from your screen's model, then send them back to the desk:

   ```ts
   import { completeActivity } from '../../services/progress';
   import { ROUTES } from '../../routes';

   await completeActivity('articles');
   navigate(ROUTES.desk);
   ```

   The desk shows the Done! note and unlocks the next activity on its own.

The activity names are `'articles'`, `'social'`, `'interviews'`, `'aiMinigame'`, and `'deskMinigame'`.

## How it's tested

Run the tests from `frontend/` with `npm test`.

### What the tests check

| Test file | What it checks |
| --- | --- |
| `Desk/tests/deskRules.test.ts` | The unlock rules: an empty desk, each step unlocking the next, all three done, and minigames not unlocking anything |
| `Desk/tests/deskModel.test.tsx` | The desk's behavior: Done! state for each Figma progress state, locked items not opening, each item going to the right URL, Create Article opening after Interviews, an error if progress fails to load, and starting fresh if saved progress is unreadable |
| `services/tests/progress.test.ts` | Resetting progress clears everything |

### Why the tests don't render the desk

The desk is drawn on a canvas, and our tests can't see inside a canvas (see [Konva-Testing.md](Konva-Testing.md)). Instead, the tests run `useDeskModel()` directly with `renderHook`, because every decision the desk makes lives there:

- what's done and what's locked
- where each click goes
- the error message

To "click" an item, a test calls the model's handler and checks which URL the router moved to:

```tsx
act(() => result.current.desk.onOpenActivity('articles'));
expect(result.current.path).toBe(ROUTES.onlineArticle);
```

The tests also follow two rules so they don't break for no reason:

- **They never type out text or URLs.** Labels and routes are imported from the code (`ROUTES`, etc.), so rewording a label or renaming a URL doesn't break a test.
- **They only check the URL a click goes to, not the page shown there.** That way they keep passing as the real screens replace the 404 page.

### What the tests can't check

These depend on actually drawing the desk, so we can only check them by hand with `npm run dev`:

- [ ] Every item shows up in the right place, and nothing is cut off at different window sizes.
- [ ] Each item opens its own URL. The tests check the model, not which handler each drawn item is wired to.
- [ ] Clicking where two items overlap opens the one on top.
- [ ] The hover effect works, and locked items show the "not allowed" cursor.
- [ ] Use the dev buttons to step through every progress state, and check the Done! and locked notes match the Figma frames.
