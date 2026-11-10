---
title: Skeleton — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Skeleton

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `SkeletonBlock`, `Skeleton`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `type` | `avatar` · `card` · `image` · `list-item` · `stock-row` · `table-row` · `text` |

`Skeleton` props:

| Prop | Type |
|---|---|
| `type` | `text` \| `list-item` \| `card` \| `table-row` \| `avatar` \| `image` \| `stock-row` |
| `size` | `desktop` \| `mobile` |
| `actions` | `boolean` |
| `avatar` | `boolean` |
| `checkbox` | `boolean` |
| `media` | `boolean` |

Figma → API: Figma Type maps to `type`. There is no animation in the Figma set. The observed unbound 8px gaps and geometry remain raw values; designer question: bind/confirm these dimensions (node 960:91).
