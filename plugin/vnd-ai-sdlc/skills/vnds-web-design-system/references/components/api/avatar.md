---
title: Avatar — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Avatar

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `AvatarImage`, `AvatarFallback`, `Avatar`, `AvatarGroup`

Figma: set `938:57`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

`Avatar` props:

| Prop | Type |
|---|---|
| `size` | `xs` \| `sm` \| `md` \| `lg` \| `xl` \| `xsmall` \| `small` \| `medium` \| `large` \| `xlarge` |
| `color` | `brand` \| `neutral` \| `red` \| `green` \| `cyan` \| `purple` \| `blue` \| `orange` |
| `type` | `initials` \| `icon` \| `image` |
| `initials` | `string` |
| `src` | `string` |
| `alt` | `string` |

Figma → API: Figma Color maps to the required `color` prop: Blue→blue, Brand→brand, Cyan→cyan, Green→green, Neutral→neutral, Purple→purple, Red→red. Figma Size maps to `size`: XSmall→xs, Small→sm, Medium→md, Large→lg, XLarge→xl. Figma Type is composition, not a prop: Icon uses `<AvatarFallback>` with an SVG icon child, Image uses `<AvatarImage>` (normally with an initials `<AvatarFallback>`), and Initials uses plain text in `<AvatarFallback>`. This keeps the shadcn three-part Radix API. `color` is required because Figma does not define a default color; `size` defaults to md. `AvatarGroup` supports xs/sm/md and retains max for overflow counts.

Related specs: `AvatarGroup`
