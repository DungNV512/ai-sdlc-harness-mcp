---
title: AlertBanner — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# AlertBanner

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `AlertBanner`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `color` | `brand` · `error` · `info` · `neutral` · `success` |
| `size` | `desktop` · `mobile` |
| `variant` | `solid` · `subtle` |

`AlertBanner` props:

| Prop | Type |
|---|---|
| `color` | `brand` \| `error` \| `info` \| `neutral` \| `success` \| `warning` \| `Brand` \| `Success` \| `Error` \| `Warning` \| `Info` \| `Neutral` |
| `size` | `desktop` \| `mobile` \| `Desktop` \| `Mobile` |
| `variant` | `solid` \| `subtle` \| `Soft` \| `Outline` \| `Subtle` |
| `type` | `Banner` \| `Section` \| `Floating` |
| `platform` | `Website` \| `WebDashboard` \| `Webtrading` |
| `showAction` | `boolean` |
| `showClose` | `boolean` |
| `showIcon` | `boolean` |
| `showSecondaryAction` | `boolean` |
| `showTitle` | `boolean` |
| `title` | `ReactNode` |
| `description` | `ReactNode` |
| `actionLabel` | `string` |
| `secondaryActionLabel` | `string` |
| `onAction` | `MouseEventHandler<HTMLButtonElement>` |
| `onSecondaryAction` | `MouseEventHandler<HTMLButtonElement>` |
| `onDismiss` | `MouseEventHandler<HTMLButtonElement>` |

Figma → API: Figma Color → `color`; Size → `size` (`desktop`|`mobile`); Style → `variant` (`solid`|`subtle`) because React reserves the native `style` prop. Title/description/action are content props. `AlertBanner` has no close control in the source set.
