# Testing Konva Components

**The short version:** our tests can't draw the canvas, so we don't test it. We only test the normal HTML around it: text, buttons, and what changes when you click them.

## Why the canvas can't be tested

Our tests don't run in a real browser. They run in **jsdom**, a fake browser that lives in memory. It knows about HTML elements like `<h1>`, `<p>`, and `<button>`, so tests can find them and click them. But it can't draw anything, and it doesn't support `<canvas>` at all.

Konva draws everything on a `<canvas>`. If a test tries to render a real Konva component, jsdom can't give it a canvas, and the test crashes.

## What we do instead

At the top of the test file, we replace Konva with fake components that render nothing:

```tsx
vi.mock('react-konva', () => ({
  Stage: () => null,
  Layer: () => null,
  Rect: () => null,
}));
```

`vi.mock` means: "in this test file, when the component imports `react-konva`, give it these fakes instead." Each fake returns `null`, which in React means "render nothing." The canvas just disappears from the test, and everything else renders normally.

Add any other Konva components your component uses (like `Text` or `Circle`) to the list the same way.

## What to test

Test the regular HTML parts of the component:

- **Text is on the screen:** headings, labels, values like `Color: tomato`.
- **Buttons work:** click one, then check that the text changed.

Example from [`konva.test.tsx`](../frontend/src/components/Konva-Test/tests/konva.test.tsx):

```tsx
it('toggles the color when the button is clicked', async () => {
  const user = userEvent.setup();
  render(<KonvaTest />);

  await user.click(screen.getByRole('button', { name: 'Toggle color' }));

  expect(screen.getByText('Color: steelblue')).toBeInTheDocument();
});
```

## What not to test

Don't test anything inside the canvas: shapes, colors, positions, or dragging. The tests can't see it.

**Tip:** if something matters and you want to test it, show it as text too. For example, the test component shows `Color: tomato` next to the canvas, so the test can check the color by reading that text.

## When everything is on the canvas

Some components draw *everything* with Konva, including their buttons and text, so there's no regular HTML left to test. [`MCQ`](../frontend/src/components/MCQ/mcqView.tsx) is like this. For these, make the fakes render simple HTML instead of nothing:

```tsx
vi.mock('react-konva', () => ({
  Stage: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Layer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Group: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
    <div onClick={onClick}>{children}</div>
  ),
  Rect: ({ name, fill }: { name?: string; fill?: string }) => <div data-testid={name} data-fill={fill} />,
  Text: ({ text }: { text: string }) => <span>{text}</span>,
}));
```

- `Text` shows its `text`, so `screen.getByText(...)` finds it.
- `Group` passes clicks through, so `user.click(screen.getByText('B. 4'))` triggers the group's `onClick`, just like clicking it on the real canvas.
- `Rect` exposes its `fill`. Give a shape a `name` in the component (e.g. `name="choice-1"`) and the test can check its color with `screen.getByTestId('choice-1').getAttribute('data-fill')`.

This tests what the component *tells* Konva to draw (which text, which color, what happens on click), not what Konva actually puts on the screen. Positions, sizes, and how it looks still need to be checked by eye in the browser.

**Touch screens:** Konva uses `onTap` for touch and `onClick` for the mouse. Pass the same function to both (`onClick={choose} onTap={choose}`), so the click tests cover touch too.
