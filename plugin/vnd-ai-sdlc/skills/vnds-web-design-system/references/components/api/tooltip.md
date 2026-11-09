---
title: Tooltip — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Tooltip

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `TooltipTitle`, `TooltipDescription`, `ArrowShape`, `TooltipBody`, `TooltipRow`, `TooltipStat`, `TooltipProvider`, `TooltipRoot`, `TooltipTrigger`, `TooltipContent`, `Tooltip`

Figma: page `934:3` · set `936:58`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

`Tooltip` props:

| Prop | Type |
|---|---|
| `size` | `Compact` \| `Regular` \| `Prominent` |
| `side` | `None` \| `Top` \| `Right` \| `Bottom` \| `Left` |
| `position` | `Center` \| `Start` \| `End` |

Figma → API: Figma Theme maps to Tooltip.Content theme. Figma Arrow is represented through Radix Content `side` and `align` plus inclusion/omission of Tooltip.Arrow, not through a dedicated Arrow prop.
