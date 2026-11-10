---
title: Toggle — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Toggle

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `Toggle`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `Checked` | `False` · `True` |
| `Size` | `Small` · `Medium` |
| `State` | `Default` · `Disabled` · `Focused` · `Hover` |

`Toggle` props:

| Prop | Type |
|---|---|
| `variant` | `switch` \| `theme` |
| `size` | `sm` \| `md` \| `lg` |
| `indicator` | `boolean` |
| `description` | `ReactNode` |
| `showText` | `boolean` |
| `showSupportingText` | `boolean` |

Figma → API: Checked maps to Radix Switch.Root checked/defaultChecked, Size Small|Medium maps to sm|md, State Disabled maps to disabled and Focused/Hover map to CSS pseudo states.
