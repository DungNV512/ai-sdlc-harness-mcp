---
title: Button — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Button

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `Button`

Figma: set `1462:15992`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `variant` | `primary` · `secondary` · `subtle` · `tertiary` · `link` · `link-subtle` |
| `intent` | `brand` · `negative` · `positive` |
| `size` | `compact` · `dense` · `prominent` · `regular` |
| `state` | `default` · `hover` · `pressed` · `disabled` |

`Button` props:

| Prop | Type |
|---|---|
| `variant` | `primary` \| `secondary` \| `tertiary` \| `subtle` \| `link` \| `link-subtle` |
| `intent` | `brand` \| `negative` \| `positive` |
| `size` | `prominent` \| `regular` \| `compact` \| `dense` |
| `radius` | `default` \| `full` |
| `iconOnly` | `boolean` |
| `iconLeading` | `boolean` |
| `iconLeadingSwap` | `ReactNode` |
| `iconTrailing` | `boolean` |
| `iconTrailingSwap` | `ReactNode` |
| `leadingIcon` | `ReactNode` |
| `trailingIcon` | `ReactNode` |
| `label` | `string` |

Figma → API: Hierarchy → prop variant theo API cva của Button trong Stockbook; các giá trị Figma viết kebab-case. Intent và Size giữ thành prop. Icon only=False render Button; Icon only=True là component IconButton riêng để giữ cùng size trong family. State không là prop: hover/pressed dùng :hover/:active, Disabled dùng disabled/aria-disabled. Nội dung và icon là children; asChild dùng Radix Slot.
