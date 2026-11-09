---
title: Chip — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Chip

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `Chip`

Figma: set `1510:568`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `avatar` | `false` · `true` |
| `selected` | `false` · `true` |
| `size` | `sm` · `md` · `lg` |
| `state` | `default` · `hover` · `disabled` |

`Chip` props:

| Prop | Type |
|---|---|
| `size` | `sm` \| `md` \| `lg` |
| `radius` | `default` \| `full` |
| `selected` | `boolean` |
| `label` | `string` |
| `count` | `ReactNode` |
| `showCount` | `boolean` |
| `leadingIcon` | `ReactNode` |
| `showLeadingIcon` | `boolean` |
| `leadingIconSwap` | `Figma icon-swap id (internal)` |
| `trailingIcon` | `ReactNode` |
| `showTrailingIcon` | `boolean` |
| `trailingIconSwap` | `Figma icon-swap id (internal)` |
| `data-state` | `string` |

Figma → API: `Avatar=false/true` → optional `avatar?: ReactNode` slot (the slot may contain the ds-one Avatar); `Selected` → controlled `selected` and `aria-pressed`; `Size=Small/Medium/Large` → `size=sm/md/lg`; `State=Hover` uses native hover CSS, and `State=Disabled` maps to the HTML `disabled` attribute. `Default` is the normal enabled state.
