# Artwork and semantic color adaptation

## Expand artwork without stretching

- Inspect the original dimensions, subject cluster, empty space, and edge
  continuation before generating.
- Preserve faces, proportions, line character, and count of important subjects.
- Extend background texture and atmosphere into the new landscape area.
- Place the strongest subject detail outside the text-safe region.
- Use `cover` only when the focal point remains visible at both target sizes.
- Prefer one source asset and responsive positioning over separate unrelated
  desktop and compact illustrations.

## Low-saturation and Morandi direction

Translate “Morandi” into measurable UI choices:

- reduce chroma before reducing luminance contrast;
- use warm greige, muted khaki, dusty sage, stone, graphite, and soft ivory;
- reserve one restrained cool accent for focus and links;
- keep body text dark enough for small sizes;
- distinguish surfaces through luminance and borders, not vivid hue;
- avoid placing beige text on beige backgrounds or dark text on translucent
  dark cards.

Define at least:

```text
canvas, surface, raised, control,
text, muted, disabled,
accent, border, focus,
success, warning, danger,
terminalBackground, terminalForeground
```

## Readability veil

Use a route-scoped gradient between artwork and content. The veil should:

- be strongest under conversation text and the composer;
- preserve recognizable artwork in the intended focal area;
- avoid covering settings with decorative art by default;
- stay opaque enough that text contrast does not depend on image pixels.

When artwork remains visible behind text, test the lightest and darkest local
image regions rather than sampling only the average background.

## Candidate selection

Generate multiple candidates when the user has not fixed:

- subject placement;
- background hue;
- saturation level;
- crop or expansion direction.

Number the candidates and ask for a choice. Once chosen, retain that exact
candidate as the managed source asset; do not silently regenerate it later.
