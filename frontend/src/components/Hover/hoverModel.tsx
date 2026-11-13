import { useState } from 'react';

// Shared by buttons with a hover effect: tracks whether the mouse is over the
// element and whether it has focus. Spread `handlers` onto the element; each
// view decides which of `hovered` / `focused` shows the effect.
export function useHoverModel() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return {
    hovered,
    focused,
    handlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    },
  };
}
