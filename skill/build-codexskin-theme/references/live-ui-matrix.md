# Live Codex UI verification matrix

Verify each mounted surface after activation.

| Area | Required states |
|---|---|
| Shell | sidebar, header, content, dividers, wide and narrow |
| Sidebar | idle, hover, selected, long title, row actions, project tooltip |
| Conversation | user and assistant text, links, lists, code, attachments |
| Composer | placeholder, typing, focus, model/effort selectors, disabled/running |
| Portals | profile menu, slash menu, selects, dialogs, tooltips |
| Settings | every available category, selected navigation, cards and controls |
| Work surfaces | output, source panel, diff, breadcrumbs, changed-file states |
| Terminal | host, viewport, screen, ANSI colors after xterm mounts |
| Motion | loading, shimmer, running, expanded/open, reduced motion |
| Recovery | route change, renderer reload, switch, rollback, restore |

## Evidence

For every reported defect, retain:

- the trigger route and interaction;
- the live root selector or role;
- pre-fix computed background and foreground;
- post-fix computed background and foreground;
- a real post-fix screenshot;
- the final audit result.

## Status labels

- `verified`: mounted and checked in the real app;
- `warning`: readable but below preferred contrast or visually imperfect;
- `not mounted`: unavailable in the current task and not tested;
- `skipped auxiliary-window`: intentionally excluded by the official runtime;
- `failed`: unreadable text, broken controls, overflow, clipping, or wrong
  active theme.

Never convert `not mounted` into `verified`.
