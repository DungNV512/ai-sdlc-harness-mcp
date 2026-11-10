---
title: Badge — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Badge

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `BadgeLabel`, `Badge`, `BadgeWithLabel`

Figma: page `817:35248` · set `1484:12503`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `effect` | `soft` · `subtle` |
| `color` | `blue` · `brand` · `cyan` · `green` · `purple` · `red` · `neutral` |
| `size` | `sm` · `md` · `lg` |
| `content` | `avatar` · `dot` · `dot-only` · `icon-leading` · `icon-trailing` · `label-left` · `label-right` · `text` |

`Badge` props:

| Prop | Type |
|---|---|
| `label` | `ReactNode` |
| `subLabel` | `ReactNode` |
| `iconSwap` | `Figma icon-swap id (internal)` |
| `icon` | `ReactNode` |
| `avatarInitials` | `string` |
| `indicator` | `ReactNode` |
| `avatar` | `ReactNode` |
| `leading` | `ReactNode` |
| `trailing` | `ReactNode` |

Figma → API: Figma Color → color; Style → effect; Size Small/Medium/Large → sm/md/lg. Content được biểu diễn bằng children, leading/trailing, avatar và indicator; không tạo boolean riêng cho từng nội dung. Không có state trong set.

Related specs: `BadgeParts`
