---
title: IconButton — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# IconButton

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `IconButton`

Figma: set `1462:15992`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `variant` | `primary` · `secondary` · `subtle` · `tertiary` · `link` · `link-subtle` |
| `intent` | `brand` · `negative` · `positive` |
| `size` | `compact` · `dense` · `prominent` · `regular` |
| `state` | `default` · `hover` · `pressed` · `disabled` |

`IconButton` props:

| Prop | Type |
|---|---|
| `variant` | `primary` \| `secondary` \| `tertiary` \| `subtle` \| `link` \| `link-subtle` |
| `intent` | `brand` \| `negative` \| `positive` |
| `size` | `prominent` \| `regular` \| `compact` \| `dense` |
| `aria-label` | `string` |

Figma → API: Hierarchy → prop variant; Intent và Size là prop. Icon only=True → IconButton riêng, không thêm size vào Button. State không là prop: hover/pressed dùng :hover/:active, Disabled dùng disabled/aria-disabled. Icon là children và aria-label bắt buộc. Icon fill bind /Color/text/primary (356:11452) nên không lấy currentColor từ label. asChild dùng Radix Slot.
