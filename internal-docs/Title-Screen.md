# Title Screen

The title screen is the game's entry screen. This doc explains what it does,
where its code lives, how its buttons are routed, and how it's tested.

## What it does

The title screen is the page at `/`. It fills the viewport with the gingham
background and title artwork, then shows the three available actions:

| Button | What it does | Goes to |
| --- | --- | --- |
| START | Begins the game | `/desk` |
| OPTIONS | Opens the options screen | `/options` |
| Teacher Dashboard | Opens the teacher dashboard | `/teacher-dashboard` |

The options and teacher dashboard screens are not built yet. Their URLs are
handled by the catch-all route, so they show the 404 page for now. They are
placeholder routes rather than completed screens.

### Button behavior

Each button is a Konva group containing a rounded rectangle and centered text.
Clicking a button uses React Router navigation. Hovering a button scales it
slightly and changes the canvas cursor to a pointer.

### Fits any window size

The title screen is fixed to the viewport with no outer margin, so the
background reaches every edge of the visible screen. The Konva stage tracks the
window's width and height and updates when the window is resized.

Button positions and sizes use a layout scale based on a 410 by 877 reference
viewport:

```ts
const layoutScale = Math.min(
  dimensions.width / 410,
  dimensions.height / 877,
);
```

The artwork and button dimensions are multiplied by this scale so the
composition keeps its proportions on different window sizes. The background
uses `cover` so it fills the viewport without leaving a white border.

## Where the code is

Everything is in `frontend/src/`:

```
frontend/src/
├── App.tsx                              <- the router and screen entry point
├── routes.ts                            <- the URL of every screen
└── components/
    ├── Not-Found/
    │   └── notFoundView.tsx             <- placeholder for unfinished routes
    └── TitleScreen/
        ├── titleScreenView.tsx          <- screen layout and navigation
        ├── titleButton.tsx              <- reusable Konva button
        └── tests/
            └── titleScreen.test.tsx     <- title screen unit and integration tests
```

The title screen uses these assets:

```
frontend/src/assets/
├── gingham_bg.png                       <- full-screen background
├── title_img.png                        <- cat artwork
└── title.png                            <- title artwork
```

The files depend on each other in one direction:

```
App.tsx -> titleScreenView.tsx -> titleButton.tsx
              |                 -> URLImage.tsx
              -> routes.ts (to navigate)
```

### Which file do I open?

| I want to... | Open |
| --- | --- |
| Change the title screen layout or artwork placement | `TitleScreen/titleScreenView.tsx` |
| Change a button's appearance or hover effect | `TitleScreen/titleButton.tsx` |
| Change what a button does | `TitleScreen/titleScreenView.tsx` and `routes.ts` |
| Add the real options screen | `App.tsx` and the new options screen component |
| Add the real teacher dashboard | `App.tsx` and the new dashboard component |
| Change or rename a URL | `routes.ts`, then `App.tsx` |

## Hooking up an unfinished screen

When the options or teacher dashboard screen is built:

1. Keep its existing path in `routes.ts`, unless the URL is intentionally
   changing.
2. Import the new screen in `App.tsx`.
3. Add its route above the `"*"` route:

   ```tsx
   <Route path={ROUTES.options} element={<Options />} />
   ```

4. Replace the 404 placeholder with the new screen by adding the corresponding
   route. The title screen button already navigates to the correct path.

When the Central View is replaced or renamed, update `ROUTES.desk` and keep
the START button using that route constant rather than a hard-coded string.

## How it's tested

Run the tests from `frontend/` with `npm test`.

### What the tests check

| Test file | What it checks |
| --- | --- |
| `TitleScreen/tests/titleScreen.test.tsx` | Each button navigates to its configured route, the title artwork and all three buttons render, button positions use the expected layout scale, and the app opens on the title screen |

The tests replace Konva with small DOM test doubles because jsdom does not
provide a real canvas. This keeps the tests focused on the title screen's
observable behavior:

- button labels and count
- artwork rendering
- configured button positions
- navigation after clicking
- the default route and START-to-desk integration

The tests import route values from `routes.ts`, so changing a route in one
place does not leave a duplicated URL in the test.

### What the tests can't check

These require running the app with `npm run dev` and checking the screen in a
browser:

- [ ] The background fills every edge at different window sizes.
- [ ] The artwork is positioned correctly at different aspect ratios.
- [ ] The hover scale and pointer cursor work on each button.
- [ ] The buttons look correct with the Coiny font loaded.
- [ ] The options and teacher dashboard screens replace the 404 page when they
  are implemented.
