---
title: Card — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Card

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `Card`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `type` | `default` · `horizontal` · `stat` · `stock` |
| `state` | `default` · `hover` |

`Card` props:

| Prop | Type |
|---|---|
| `type` | `default` \| `horizontal` \| `stat` \| `stock` |

Figma → API: Figma Type maps to `type` (default | horizontal | stat | stock). Figma State=Hover maps to `:hover`, not a React prop. Card content is caller supplied children.
