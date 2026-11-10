---
title: InlineMessage — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# InlineMessage

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `InlineMessage`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `color` | `error` · `info` · `neutral` · `success` · `warning` |
| `size` | `sm` · `md` |
| `variant` | `filled` · `text` |

`InlineMessage` props:

| Prop | Type |
|---|---|
| `color` | `info` \| `success` \| `warning` \| `error` \| `neutral` |
| `size` | `sm` \| `md` |
| `variant` | `text` \| `filled` |
| `icon` | `boolean` |

Figma → API: Figma Color → `color`; Size → `size` (`sm`|`md`); Style → `variant` (`filled`|`text`). Message content is supplied as children; `icon` can replace the status icon.
