---
title: Checkbox — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Checkbox

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `ControlText`, `Checkbox`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `Checked` | `False` · `True` · `Indeterminate` |
| `Size` | `Small` · `Medium` |
| `State` | `Default` · `Hover` · `Disabled` |
| `Type` | `Checkbox` |

`Checkbox` props:

| Prop | Type |
|---|---|
| `size` | `sm` \| `md` |
| `description` | `ReactNode` |
| `showText` | `boolean` |
| `showSupportingText` | `boolean` |
| `controlClassName` | `string` |

Figma → API: Figma Type=Checkbox|Radio maps to Checkbox.tsx|Radio.tsx. Size Small|Medium maps to sm|md. Checked False|True|Indeterminate maps to Radix checked state; State maps to Radix disabled and CSS hover/focus states.
