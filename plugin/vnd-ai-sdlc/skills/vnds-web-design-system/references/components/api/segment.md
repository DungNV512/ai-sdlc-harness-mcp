---
title: Segment — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Segment

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `SegmentRoot`, `SegmentItem`, `Segment`

Figma: set `961:117`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

`Segment` props:

| Prop | Type |
|---|---|
| `appearance` | `Contained` \| `Plain` \| `Line bottom` |
| `color` | `Brand` \| `Neutral` \| `brand` \| `neutral` |
| `icon` | `None` \| `Only` \| `Leading` \| `Trailing` |
| `item3` | `boolean` |
| `item4` | `boolean` |
| `item5` | `boolean` |
| `item6` | `boolean` |
| `more` | `boolean` |
| `radius` | `Default` \| `Full` \| `default` \| `full` |
| `size` | `Regular` \| `Compact` \| `sm` \| `md` |
| `width` | `Hug` \| `Fill` \| `hug` \| `fill` |
| `value` | `string` |
| `defaultValue` | `string` |
| `onValueChange` | `function` |

Figma → API: Figma Size → size prop. Items is the count of children, not a prop. Selected/State are Radix ToggleGroup.Item state. Radix ToggleGroup type is fixed to single as requested.
