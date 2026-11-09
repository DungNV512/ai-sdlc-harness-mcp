---
title: Toast — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Toast

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `Toast`, `Toaster`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `status` | `default` · `error` · `info` · `success` · `warning` |
| `theme` | `dark` · `light` |

`Toast` props:

| Prop | Type |
|---|---|
| `status` | `default` \| `success` \| `error` \| `warning` \| `info` |
| `variant` | `soft` \| `subtle` \| `outline` |
| `size` | `website` \| `mobile` |
| `message` | `string` |
| `action` | `boolean \| ReactNode` |
| `actionText` | `string` |
| `onAction` | `function` |
| `close` | `boolean` |
| `duration` | `number` |
| `onClose` | `function` |
| `closeLabel` | `string` |
| `icon` | `ReactNode` |

Figma → API: Figma Status → `status` (`default`|`error`|`info`|`success`|`warning`); Theme → `theme` (`dark`|`light`) because the two variants bind different background variables. `Toaster` installs Radix Toast Provider/Viewport; `toast()` and status methods enqueue messages imperatively. `label` and `closeLabel` are required on Toaster because this package has no LocaleProvider.
