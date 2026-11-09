---
title: Tabs — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Tabs

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `TabsRoot`, `TabsList`, `TabItem`, `TabsTrigger`, `TabsContent`, `Tabs`

Figma: set `937:157`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

`Tabs` props:

| Prop | Type |
|---|---|
| `appearance` | `Fill` \| `Outline` \| `Line bottom` |
| `color` | `Brand` \| `Neutral` \| `brand` \| `neutral` |
| `icon` | `None` \| `Only` \| `Leading` \| `Trailing` |
| `iconSwap` | `Figma icon-swap id (internal)` |
| `label` | `string` |
| `radius` | `Default` \| `Full` \| `default` \| `full` |
| `selected` | `False` \| `True` |
| `size` | `Regular` \| `Compact` \| `regular` \| `compact` |
| `count` | `boolean` |
| `iconPosition` | `none` \| `left` \| `right` \| `only` |
| `width` | `hug` \| `fill` |

Figma → API: Figma Type → prop variant on Tabs. Current/State belong to Radix Tabs.Trigger state and CSS; _Tab button is exposed as TabsTrigger, not an independent component. Radix Tabs manages selection, orientation and keyboard behavior.
