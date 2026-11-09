---
title: Slider — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Slider

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `SliderAddon`, `SliderMark`, `SliderThumb`, `SliderRail`, `Slider`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `type` | `single` · `range` |
| `state` | `default` · `focused` · `disabled` |

`Slider` props:

| Prop | Type |
|---|---|
| `size` | `Compact` \| `Regular` |
| `selection` | `Single` \| `Range` |
| `type` | `Single` \| `Range` |
| `header` | `boolean` |
| `label` | `string` |
| `required` | `boolean` |
| `info` | `boolean` |
| `leading` | `boolean` |
| `trailing` | `boolean` |
| `leadingText` | `string` |
| `trailingText` | `string` |
| `markLabels` | `boolean` |
| `valueTextVisible` | `boolean` |
| `valueText` | `string` |
| `helper` | `boolean` |
| `helperText` | `string` |
| `errorValue` | `string` |

Figma → API: Figma Type=Single/Range maps to one/two values on Radix Slider (`value` cardinality). Focused is `:focus-visible`; Disabled is Radix `disabled`.
