---
title: FeaturedIcon — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# FeaturedIcon

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `FeaturedIcon`

Figma: page `934:8` · set `1617:505`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

`FeaturedIcon` props:

| Prop | Type |
|---|---|
| `intent` | `Brand` \| `Positive` \| `Warning` \| `Negative` \| `Info` \| `Neutral` \| `brand` \| `positive` \| `warning` \| `negative` \| `info` \| `neutral` |
| `size` | `Large` \| `Medium` \| `large` \| `medium` |

Figma → API: Figma Intent maps to `intent`, Size maps to `size`; the component accepts the caller's Icon as children so applications can use the existing ds-one icon exports.
