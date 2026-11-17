# Back Confirmation

A shared back button and an "Are You Sure?" popup that stops the player leaving an activity by accident and losing their progress (issue #57). This doc explains what it does, which screens use it, how to add it to a new screen, and how it's tested.

## What it does

Every activity screen has a round back arrow in its top left corner. Clicking it opens a popup over the screen:

> **Are You Sure?**
>
> You will lose all your progress on *AI Images* if you go back.
>
> [ Go Back ] [ Stay ]

| Action | What happens |
| --- | --- |
| **Go Back** | The popup closes and the player leaves the activity (to the desk) |
| **Stay** | The popup closes and nothing else changes |
| **Escape** | Same as Stay |
| **Enter** (as soon as it opens) | Same as Stay, since Stay has focus |
| Clicking the dimmed background | Nothing. The player has to choose. |

While the popup is open, a dimmed layer covers the whole window, so nothing on the screen underneath can be clicked.

If the player has nothing left to lose (e.g. the activity is finished), the back arrow leaves straight away without asking.

### Which screens use it

| Screen | Activity name in the message | When it asks |
| --- | --- | --- |
| Article Writing (`/create-article`) | "your article" | Always |
| AI Minigame (`/ai-image`) | "AI Images" | During a game. Not once the results are showing. |
| Online Articles (`/online-article`) | "Online Articles" | Until the level is passed |

Screens with nothing to lose don't use it: the title screen, the desk (it's where back goes *to*), the endings and the 404 page. Interview and Social Media should use it once they're built.

### Look

The layout follows the [Back Figma frame](https://www.figma.com/design/bgVtm8bS5bJKMasBZrqcJA/CSE110-Mockups?node-id=110-691). The styling matches the **Settings** popup instead of the mockup, so the game's two popups look alike:

| Part | Style |
| --- | --- |
| Box | Same as Settings: `#F7FCFD` background, 8px `#6FB3F3` border, 24px corners, `rgba(0, 0, 0, 0.6)` overlay |
| "Are You Sure?" | Coiny, like the Settings title |
| Message | Arial (the desk's `FONT`) |
| Go Back / Stay | Bold Arial, red / green from the mockup, rounded with a brown outline. On hover each darkens slightly over 150ms, with no size change. Keyboard focus shows the browser's normal outline instead, so Stay doesn't look hovered when the popup opens. |
| Back arrow | Round brown button with a white arrow (first made for the AI Minigame). On hover or keyboard focus it grows 1.05× (like the title screen buttons) and lightens slightly, over 150ms. |

All colors are in `theme.ts`: `backButton`, `backButtonArrow`, `backButtonHover`, `overlay`, `popupBox`, `popupBorder`, `popupText`, `goBackButton`, `goBackButtonHover`, `stayButton` and `stayButtonHover`.

## Where the code is

Everything is in `frontend/src/`:

```
frontend/src/
├── theme.ts                            ← the colors above
└── components/
    ├── Hover/
    │   ├── hoverModel.tsx              ← whether a button is hovered or focused (shared)
    │   └── tests/hoverModel.test.tsx
    ├── Back-Button/
    │   ├── backButtonView.tsx          ← the round arrow (display only)
    │   └── tests/backButton.test.tsx
    └── Back-Confirmation/
        ├── backConfirmationView.tsx    ← the popup (display only)
        ├── backConfirmationModel.tsx   ← open/closed state and Escape, for a screen's model
        ├── backConfirmationContent.ts  ← title, button labels, the message
        ├── parts/
        │   └── confirmButtonView.tsx   ← Go Back / Stay, with their hover effect
        └── tests/
            ├── backConfirmation.test.tsx
            └── backConfirmationModel.test.tsx
```

The pieces follow the [File Structure Guide](File-Structure-Guide.md)'s view / model split. The two views only display what they're given, with no `useState` or `useEffect`. The screen's **model** decides when the popup is open, what Go Back does, and listens for Escape, using `useBackConfirmationModel`:

```
screen view  →  backButtonView.tsx        (onClick = onBack)
             →  backConfirmationView.tsx  (isOpen, onGoBack, onStay)
screen model →  backConfirmationModel.tsx (onLeave, hasProgressToLose)
             →  routes.ts                 (where Go Back goes)
```

Because Escape is handled in the model, a screen that renders `<BackConfirmation>` without `useBackConfirmationModel` won't close on Escape. Always use them together.

### The pieces

**`<BackButton onClick size? style? />`** (`backButtonView.tsx`): the arrow. It's in the top left (16px in) of the nearest positioned element by default. Pass `size` to scale it, or `style` to nudge it. Its hover state comes from the shared `useHoverModel` (`Hover/hoverModel.tsx`), so the view has no state of its own. Go Back and Stay use the same hook. Its accessible name is "Back to desk" (`BACK_BUTTON_LABEL`).

**`<BackConfirmation isOpen activityName onGoBack onStay />`** (`backConfirmationView.tsx`): the popup. It shows nothing while `isOpen` is false. `activityName` goes into the message, so nothing is written for one particular screen.

**`useBackConfirmationModel({ onLeave, hasProgressToLose? })`** (`backConfirmationModel.tsx`): while the popup is open, Escape closes it like Stay. Returns:

| Field | Give it to |
| --- | --- |
| `onBack` | The back button's `onClick`. Opens the popup, or calls `onLeave` straight away if `hasProgressToLose` is false. |
| `confirmation` | `<BackConfirmation {...confirmation} />`: `isOpen`, `onGoBack` (closes, then calls `onLeave`) and `onStay` (closes) |

`hasProgressToLose` defaults to `true`.

## Adding it to a new screen

1. **In the screen's model**, call the hook and return its parts:

   ```ts
   import { useBackConfirmationModel } from '../Back-Confirmation/backConfirmationModel';

   const { onBack, confirmation } = useBackConfirmationModel({
     onLeave: () => navigate(ROUTES.desk),
     hasProgressToLose: !finished, // leave out to always ask
   });

   return { ..., onBack, backConfirmation: confirmation };
   ```

2. **In the screen's view**, add the button and the popup inside the screen's `<main>`:

   ```tsx
   import BackButton from '../Back-Button/backButtonView';
   import BackConfirmation from '../Back-Confirmation/backConfirmationView';

   <BackButton onClick={onBack} />
   <BackConfirmation activityName="Interviews" {...backConfirmation} />
   ```

   Keep the activity name in the screen's content file (e.g. `ACTIVITY_NAME` in `newsArticleContent.ts`), so tests can import it.

3. **Add tests** like the ones in `newsArticle.test.tsx` (`describe('back button')`): the popup names the activity, Go Back leaves, Stay and Escape don't.

### ⚠️ Don't put the popup inside a scaled or transformed element

The popup's overlay uses `position: fixed` to cover the window. Inside an element with a CSS `transform` (like Article Writing's `<section>`, which is scaled to fit the window), "fixed" is measured from that element instead, so the overlay ends up the wrong size and off center.

Put `<BackConfirmation>` **outside** any transformed element, as a direct child of `<main>`. Article Writing does this, and `articleWriting.test.tsx` checks that the overlay isn't inside the `<section>`. The **back button** can go inside a scaled element, and Article Writing's does, so it scales with the screen.

## Decisions

| Decision | Why | Trade-off |
| --- | --- | --- |
| HTML on top of the screen, not drawn in Konva | Works on every screen, canvas or not. Screen readers and keyboards work. Tests can find it by role. | Its styling is separate from the canvas buttons |
| No portal (rendered where the screen puts it) | Simpler, and matches Settings | Screens must keep it outside transformed elements (see above) |
| Escape = Stay, clicking the background does nothing | Every shortcut keeps the player's progress, so nobody loses work by accident | Players can't click outside to close it |
| Stay has focus when it opens | Pressing Enter also keeps the progress | — |
| Skip the popup when there's nothing to lose | Asking "lose your progress?" after finishing would be confusing | Each screen's model decides what counts as finished |
| Styled like Settings, not the mockup's orange border | The game's two popups look alike | Differs from the Figma frame |

## How it's tested

Run the tests from `frontend/` with `npm test`.

| Test file | What it checks |
| --- | --- |
| `Back-Confirmation/tests/backConfirmation.test.tsx` | The view: hidden while closed. The title and the activity name in the message, with nothing written for one screen. Go Back and Stay each call only their own callback. Stay has focus, so Enter is Stay. The overlay covers the window, takes clicks, and clicking it does nothing. Fonts, and styling matching Settings. Go Back and Stay each darken on hover without changing size and go back on unhover, Stay isn't highlighted just because it starts focused, and the color change fades. |
| `Back-Confirmation/tests/backConfirmationModel.test.tsx` | The model: starts closed. Back opens it instead of leaving. Go Back closes and leaves. Stay closes without leaving. Leaves straight away when there's nothing to lose. Escape closes it like Stay, other keys don't, and the Escape listener is removed once it closes or the screen unmounts. |
| `Hover/tests/hoverModel.test.tsx` | Starts neither hovered nor focused. Tracks the mouse entering and leaving, and focus separately from hover. |
| `Back-Button/tests/backButton.test.tsx` | Has the "Back to desk" name and calls `onClick`. Sits in the top left by default, and can be resized and moved. Grows and lightens on hover and goes back on unhover, does the same with keyboard focus, and animates the change. |
| `AI-Minigame/tests/aiMinigame.test.tsx` | Mid-game, the arrow asks first and Go Back goes to the desk. Stay keeps the same image. From the results, it leaves without asking. |
| `NewsArticle/tests/newsArticle.test.tsx` | Asks first, naming "Online Articles". Go Back goes to the desk. Stay and Escape keep the article. |
| `Article-Writing/tests/articleWriting.test.tsx` | Asks first, and Go Back calls `onBack`. Stay doesn't. The overlay is outside the scaled section. |
| `Article-Writing/tests/articleWritingFlow.test.tsx` | Through the whole app: back asks first, then Go Back lands on `/desk`. |

### "The screen underneath can't be clicked"

jsdom can't tell which element is under a click, so a test can't show directly that a click doesn't go through. Like the Settings tests, these check that the overlay is `position: fixed`, covers the window (`inset: 0`), sits on top (`z-index: 1000`), takes clicks (not `pointer-events: none`), and that the dialog is `aria-modal`.

### What the tests can't check

These need a browser, so check them by hand with `npm run dev`:

- [ ] On each of the three screens, the back arrow is in the top left and doesn't cover anything.
- [ ] Hovering the back arrow grows it smoothly without it being cut off or covering the progress bar.
- [ ] Hovering Go Back and Stay darkens them smoothly.
- [ ] The popup is centered and covers the whole window at different window sizes, especially on Article Writing.
- [ ] Clicking the screen behind the popup (e.g. a canvas card) does nothing.
- [ ] The popup looks like the Settings popup.

## Known limitations

- **Escape with Settings open:** Settings also closes on Escape. If both were open at once, one press would close both. They aren't open together on any screen today.
- **Focus isn't trapped:** Tab can move focus out of the popup to buttons behind it (clicks can't). Settings works the same way.
- **`Button-Back.png`** in `assets/` (the orange arrow from the mockup) isn't used. The round arrow replaced it.
