---
title: Accordion — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Accordion

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `AccordionRoot`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`, `Accordion`

Figma: set `950:113`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

`Accordion` props:

| Prop | Type |
|---|---|
| `variant` | `plain` \| `card` |
| `size` | `regular` \| `small` |

Figma → API: Figma Type → variant prop; Radix Accordion.Root type remains single|multiple. Expanded/State are controlled by Radix data-state. Accordion exposes Root, Item, Trigger and Content.
