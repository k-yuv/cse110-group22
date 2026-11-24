# Settings Menu

The settings menu is a popup that opens on top of whatever screen the player is on. This sprint built its frame (the overlay, the box, the title, and the ways to close it). The actual settings inside it come in sprint 2. This doc explains what it does, where its code lives, and how it's tested.

## What it does

There are two pieces:

| Piece | What it is | Used on |
| --- | --- | --- |
| `Settings` | The popup itself. Dims the screen and shows a titled box with whatever is passed in as `children`. | Title screen (opened by **OPTIONS**) |
| `SettingsButton` | A gear icon in a corner that opens a `Settings` popup when clicked | Desk |

Right now both places pass no `children`, so the popup is an empty box titled "Settings".

### Opening and closing

- **Title screen:** clicking **OPTIONS** opens the popup without leaving the page.
- **Desk:** clicking the gear icon in the top left opens it.
- Click the **✕** in the top right corner, or press **Escape**, to close it. Other keys do nothing.

While the popup is open, a dark overlay covers the whole window so nothing behind it can be clicked.

### Look

The popup matches the title screen: Coiny font, an off-white box (`#F7FCFD`) with brown text (`#4C2100`), and a thick blue border (`#6FB3F3`) with rounded corners. It's 400 px wide, or 90% of the window on narrow screens.

### Props

`Settings` doesn't keep its own open/closed state. The screen that uses it decides:

| Prop | Type | What it does |
| --- | --- | --- |
| `isOpen` | `boolean` | Shows the popup when `true`. When `false` it renders nothing. |
| `title` | `string` | The heading, also used as the dialog's accessible name |
| `onClose` | `() => void` | Called when ✕ is clicked or Escape is pressed |
| `children` | `ReactNode` | What goes inside the box, under the title |

`SettingsButton` keeps the open/closed state itself and takes only where to sit:

| Prop | Default | What it does |
| --- | --- | --- |
| `x` | `20` | Pixels from the left of the screen |
| `y` | `20` | Pixels from the top of the screen |
| `size` | `60` | Width and height of the icon in pixels |

### Not built here

- The settings themselves (volume, text size, etc.). Those are sprint 2.
- Saving settings between visits.
- The `/options` route in `routes.ts` is no longer used by the title screen, since OPTIONS opens the popup instead.

## Where the code is

Everything is in `frontend/src/`:

```
frontend/src/
├── assets/
│   └── settings.png                    ← the gear icon
└── components/
    ├── Settings/
    │   ├── Settings.tsx                ← the popup (overlay, box, title, close)
    │   └── tests/
    │       └── Settings.test.tsx
    └── SettingsButton/
        ├── SettingsButton.tsx          ← gear icon that opens a Settings popup
        └── tests/
            └── SettingsButton.test.tsx
```

The files depend on each other in one direction:

```
TitleScreen/titleScreenView.tsx  →  Settings/Settings.tsx
Desk/deskView.tsx  →  SettingsButton/SettingsButton.tsx  →  Settings/Settings.tsx
```

Both are plain HTML, not Konva, so they sit on top of a screen's canvas.

### Which file do I open?

| I want to... | Open |
| --- | --- |
| Add the real settings (sliders, toggles, etc.) | Pass them as `children` in `SettingsButton.tsx` and `TitleScreen/titleScreenView.tsx`, or make one shared settings-content component and pass it in both places |
| Change the popup's colors, border, or size | `Settings/Settings.tsx` |
| Change how the popup closes | `Settings/Settings.tsx` |
| Change the gear icon or its position | `SettingsButton/SettingsButton.tsx` or `assets/settings.png` |
| Add a settings button to another screen | Render `<SettingsButton />` in that screen's view |

## Adding the real settings (sprint 2)

The title screen and the desk each create their own popup, so the contents need to be passed to both. The simplest way:

1. Make a component (for example `Settings/SettingsContent.tsx`) with the actual controls.
2. Pass it as the popup's children in both places:

   ```tsx
   <Settings isOpen={isOpen} onClose={...} title="Settings">
       <SettingsContent />
   </Settings>
   ```

3. If a setting has to affect other screens (like volume), keep its value somewhere shared, such as a service in `services/`, not inside the popup. The popup unmounts when it's closed, so any `useState` inside it is lost.

## How it's tested

Run the tests from `frontend/` with `npm test`.

| Test file | What it checks |
| --- | --- |
| `Settings/tests/Settings.test.tsx` | Nothing renders when closed. The title and children render when open. The full-screen dimming overlay and `aria-modal`. ✕ and Escape call `onClose`, other keys don't. The colors and font match the title screen. |
| `SettingsButton/tests/SettingsButton.test.tsx` | The button renders. The popup starts closed, opens on click, and closes with ✕. A custom `size` changes the icon's size. |
| `TitleScreen/tests/titleScreen.test.tsx` | OPTIONS opens the popup without navigating, and ✕ closes it |

Both components are plain HTML, so the tests use React Testing Library directly and don't need the Konva mocks described in [Konva-Testing.md](Konva-Testing.md).

### What the tests can't check

Check these by hand with `npm run dev`:

- [ ] The popup is centered and fully visible at different window sizes, including narrow ones.
- [ ] The overlay covers the title screen and desk canvases, and nothing behind it reacts to clicks.
- [ ] The gear icon on the desk doesn't overlap other desk items.
- [ ] The Coiny font loads in the popup.

### Known limitations

- Clicking the dark overlay outside the box doesn't close the popup. Only ✕ and Escape do.
- Focus isn't moved into the popup when it opens or kept inside it, so Tab can reach buttons behind the overlay.
