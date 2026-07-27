# Safe CSS and Portal repair patterns

## Scope every rule

Start every theme rule from:

```css
:root[data-codexskin-theme="<theme-id>"]
```

Bridge semantic variables on the smallest verified component root. When a
surface changes from dark to light, override its foreground, secondary text,
icons, borders, hover background, and active-selection foreground together.

## Portal surfaces

Menus, dialogs, and tooltips may be mounted under `body` rather than inside the
sidebar or content component that opened them. Inspect and theme each live root:

```css
:root[data-codexskin-theme="<theme-id>"] [role="menu"],
:root[data-codexskin-theme="<theme-id>"] [role="dialog"],
:root[data-codexskin-theme="<theme-id>"] [role="tooltip"] {
  --color-token-text-primary: var(--theme-text);
  --color-token-text-secondary: var(--theme-muted);
  --color-token-list-hover-background: var(--theme-hover);
  background: var(--theme-raised);
  color: var(--theme-text);
}
```

Do not assume a project row hover problem is the row itself. The information
card may be an independent tooltip with a separate dropdown-background token.

## Selected and hover states

Check both the row and its descendants:

```css
:root[data-codexskin-theme="<theme-id>"] .verified-sidebar-root {
  --color-token-list-hover-background: var(--theme-hover);
  --color-token-list-active-selection-background: var(--theme-selected);
  --color-token-list-active-selection-foreground: var(--theme-text);
}
```

If a descendant class uses an explicit active-selection foreground token,
verify its computed color after the parent rule is applied. Keep transitions
short and sample both intermediate and settled states when investigating a
flash.

## Settings cards

Do not style settings by route text. Inspect a repeated card root and apply
surface-local semantic tokens. A dark preview swatch with white text is not a
failure; a large dark card whose inherited text is also dark is.

## Avoid

- language-dependent text selectors;
- `main *`, `body *`, or universal opacity/color repairs;
- hiding controls to make a composition cleaner;
- changing geometry, overflow, or positioning without permission;
- styling a temporary class before confirming it in the real DOM;
- using a design preview as evidence for a live component state.
