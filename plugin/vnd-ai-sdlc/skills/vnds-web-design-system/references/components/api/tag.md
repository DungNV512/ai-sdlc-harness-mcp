---
title: Tag — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Tag

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `FIGMA_COLORS`, `FIGMA_APPEARANCES`, `FIGMA_SIZES`, `FIGMA_CONTENTS`, `TagLabel`, `TagAvatar`, `Tag`

Figma: page `1432:24363` · set `1497:13562`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `effect` | `outline` · `subtle` |
| `color` | `blue` · `brand` · `cyan` · `green` · `purple` · `red` · `neutral` |
| `size` | `sm` · `md` · `lg` |
| `content` | `avatar` · `icon-leading` · `icon-trailing` · `label-left` · `label-right` · `text` |

`Tag` props:

| Prop | Type |
|---|---|
| `appearance` | `Fill` \| `Outline` \| `Line bottom` |
| `color` | `Brand` \| `Neutral` \| `brand` \| `orange` \| `green` \| `cyan` \| `purple` \| `blue` \| `red` \| `neutral` |
| `effect` | `Fill` \| `Outline` \| `Line bottom` \| `subtle` \| `outline` |
| `size` | `Regular` \| `Compact` \| `small` \| `medium` \| `large` |
| `content` | `Text` \| `Icon leading` \| `Icon trailing` \| `Avatar` \| `Label left` \| `Label right` \| `text` \| `icon-leading` \| `icon-trailing` \| `avatar` \| `label-left` \| `label-right` |
| `label` | `ReactNode` |
| `subLabel` | `ReactNode` |
| `icon` | `ReactNode` |
| `iconSwap` | `Figma icon-swap id (internal)` |
| `avatarInitials` | `string` |

Figma → API: Figma Color → color; Style → effect; Size Small/Medium/Large → sm/md/lg. Content được biểu diễn bằng children, leading/trailing, avatar và indicator; không tạo boolean riêng cho từng nội dung. Không có state trong set.

Related specs: `TagParts`
