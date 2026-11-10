---
title: Divider — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Divider

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `Divider`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `orientation` | `horizontal` · `vertical` |
| `pattern` | `solid` · `dashed` |
| `type` | `line` · `text-center` · `text-left` · `button-center` |

`Divider` props:

| Prop | Type |
|---|---|
| `orientation` | `horizontal` \| `vertical` |
| `pattern` | `solid` \| `dashed` |
| `type` | `line` \| `text-center` \| `text-left` \| `button-center` |
| `weight` | `1 \| 2` |
| `label` | `string` |
| `title` | `string` |
| `buttonLabel` | `string` |

Figma → API: Figma Orientation maps to `orientation`; Figma Style maps to `pattern` because the native `style` prop is reserved; Figma Type maps to `type`. Text/button center content is supplied through children; no Button is included.
