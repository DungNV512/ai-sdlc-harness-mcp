---
title: Alert — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Alert

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `Alert`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `type` | `inline` · `toast` |
| `color` | `brand` · `error` · `info` · `neutral` · `success` |

`Alert` props:

| Prop | Type |
|---|---|
| `type` | `Banner` \| `Section` \| `Floating` \| `banner` \| `section` \| `floating` \| `inline` \| `toast` |
| `breakpoint` | `Desktop` \| `Mobile` |
| `size` | `Desktop` \| `Mobile` \| `desktop` \| `mobile` |
| `appearance` | `Soft` \| `Subtle` \| `Outline` \| `soft` \| `subtle` \| `outline` |
| `intent` | `Brand` \| `Info` \| `Positive` \| `Warning` \| `Negative` \| `Neutral` |
| `variant` | `Brand` \| `Info` \| `Positive` \| `Warning` \| `Negative` \| `Neutral` \| `brand` \| `info` \| `success` \| `warning` \| `error` \| `neutral` |
| `platform` | `Website` \| `WebDashboard` \| `Webtrading` \| `website` \| `webdashboard` \| `webtrading` |
| `showAction` | `boolean` |
| `showClose` | `boolean` |
| `showIcon` | `boolean` |
| `showSecondaryAction` | `boolean` |
| `showTitle` | `boolean` |
| `titleText` | `string` |
| `messageText` | `string` |
| `title` | `ReactNode` |
| `message` | `ReactNode` |
| `description` | `ReactNode` |
| `icon` | `ReactNode` |
| `action` | `ReactNode` |
| `actionLabel` | `ReactNode` |
| `secondaryAction` | `ReactNode` |
| `onAction` | `function` |
| `onSecondaryAction` | `function` |
| `onClose` | `function` |
| `closeLabel` | `string` |
| `theme` | `string` |

Figma → API: Figma Type → `type` (`inline`|`toast`); Color → `color` (brand|error|info|neutral|success). Title/description/action are content props. `onClose` shows an IconButton and `closeLabel` supplies its required accessible name (packages/one has no LocaleProvider). The toast type is the framed Alert variant; use `Toast` for timed announcements.
