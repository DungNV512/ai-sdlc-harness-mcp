---
title: Dock — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Dock

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `DockRoot`, `DockItem`, `Dock`

Figma: set `956:115`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

`Dock` props:

| Prop | Type |
|---|---|
| `aria-label` | `string` |
| `variant` | NonNullable<VariantProps<typeof dockVariants>[`variant`]> |

Figma → API: Dock Type → variant prop. _Dock item is exposed as DockItem. DockItem renders an anchor when href is supplied, otherwise a button; isActive sets aria-current=page.
