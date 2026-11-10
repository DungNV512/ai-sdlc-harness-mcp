---
title: Radio — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Radio

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `RadioGroup`, `Radio`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `Size` | `Small` · `Medium` |
| `State` | `Default` · `Hover` · `Disabled` |
| `Type` | `Radio` |

`Radio` props:

| Prop | Type |
|---|---|
| `size` | `sm` \| `md` |
| `description` | `ReactNode` |
| `showText` | `boolean` |
| `showSupportingText` | `boolean` |
| `checkedIcon` | `radio` \| `check` |
| `controlClassName` | `string` |

Figma → API: Separate component because Figma Type=Radio is a sibling type, not a label-presence option. It follows Radix RadioGroup.Item and must be inside the exported RadioGroup.
