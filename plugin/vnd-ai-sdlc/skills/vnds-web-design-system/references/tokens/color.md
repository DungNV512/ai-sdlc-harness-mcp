---
title: Color Tokens (Theme roles)
category: tokens
source: "@vnd/ds-one package (generated from the Figma variables: Foundation → Brand → Theme), dist/tokens/theme.css + brand.css + foundation.css"
source_package: "@vnd/ds-one 0.0.2 (dist/tokens/)"
last_synced: 2026-11-09
status: draft
notes: >
  Values resolved by following the var() chain for brand VNDS (production).
  DSB columns are the demo brand, used only for brand-switch testing.
  46 tokens = Theme collection size in Figma (matches the Figma Theme collection).
---

# Color Tokens (Theme roles)

**Product UI may use only these 46 tokens** (see [variable-usage](../guidelines/variable-usage.md)). HEX values are for reference and contrast checks. **Never hard-code them.**

Code syntax:
- CSS: `var(--color-background-surface)`
- Tailwind (ds-one `tailwind.css`): `bg-background-surface`, `text-text-secondary`, `border-border-default`, `bg-brand-primary`, `bg-system-red-secondary`
- Switching: `data-brand="vnds|dsb"` and `data-theme="dark"` on `<html>`. Light is the default.

## Background

| Token | VNDS Light | VNDS Dark | Foundation (light / dark) | Usage |
|---|---|---|---|---|
| `color-background-base` | `#FFFFFF` | `#151515` | neutral-light-0 / neutral-dark-50 | Lowest layer (page base) |
| `color-background-canvas` | `#F7F7F7` | `#1A1A1A` | neutral-light-50 / neutral-dark-100 | Page canvas |
| `color-background-surface` | `#EFEFEF` | `#202020` | neutral-light-200 / neutral-dark-200 | Panels, sections |
| `color-background-elevated` | `#DDDDDD` | `#2F2F2F` | neutral-light-300 / neutral-dark-300 | Raised layer, input fields |
| `color-background-hover` | `#DDDDDD` | `#2F2F2F` | neutral-light-300 / neutral-dark-300 | Hover / selected row, active segment |
| `color-background-disabled` | `#D6D6D6` | `#3B3B3B` | neutral-light-400 / neutral-dark-400 | Disabled controls |
| `color-background-inverse` | `#0D0D0D` | `#E2E2E2` | neutral-light-900 / neutral-dark-900 | Inverse surfaces (tooltip, toast) |
| `color-background-overlay` | `#DDDDDD` @ 80% × 70% ⚠️ | `#2F2F2F` @ 70% | — | Scrim behind modal / bottom sheet |

> ⚠️ Overlay opacity differs between themes: Light = theme map 80% then Theme 70% (≈ 56% effective), Dark = 70%. Use the token as-is.

## Text

| Token | VNDS Light | VNDS Dark | Usage |
|---|---|---|---|
| `color-text-primary` | `#0D0D0D` | `#E2E2E2` | Main text, values |
| `color-text-secondary` | `#5D5D5D` | `#888888` | Labels, secondary info |
| `color-text-tertiary` | `#7D7D7D` ⚠️ | `#606060` ⚠️ | Metadata, column headers (fails 4.5:1, see contrast) |
| `color-text-disabled` | `#AAAAAA` | `#555555` | Disabled text |
| `color-text-inverse` | `#FFFFFF` | `#0D0D0D` | Text on inverse / brand surfaces |

## Border

| Token | VNDS Light | VNDS Dark | Usage |
|---|---|---|---|
| `color-border-subtle` | `#DDDDDD` | `#2F2F2F` | Thin 1px dividers between rows |
| `color-border-default` | `#D6D6D6` | `#3B3B3B` | Input borders, dividers |
| `color-border-strong` | `#AAAAAA` | `#474747` | Emphasized borders |
| `color-border-focus` | `#7D7D7D` | `#3B3B3B` ⚠️ | Focus ring (dark fails 3:1) |

## Brand

| Token | VNDS Light | VNDS Dark | DSB Light (demo) | Usage |
|---|---|---|---|---|
| `color-brand-primary` | `#E77500` | `#FF8A2B` | `#2563EB` | Primary CTA, selected tab underline, main action icon |
| `color-brand-primary-hover` | `#F8862B` | `#FFAA72` | `#3B82F6` | Hover of primary CTA |
| `color-brand-primary-disabled` | `#FFB381` | `#7F3E03` | `#93C5FD` | Disabled primary CTA |
| `color-brand-secondary` | `#FFF0E7` | `#250F02` | `#EFF6FF` | Light brand tint (secondary button bg, highlights) |
| `color-brand-secondary-hover` | `#FFE1CF` | `#602D00` | `#DBEAFE` | Hover of brand tint |

> `color-brand-primary` Light = **`#E77500`**. Confirmed by the production tokens (the Figma frame value `#E5750A` was wrong).

## System (market & feedback)

Each family has `primary` (strong: text, numbers, chart lines, icons) and `secondary` (light: backgrounds, volume bars), each with a `-hover` variant.

| Family | Meaning ([color](../foundations/color.md#market-semantics)) | primary L / D | secondary L / D | primary-hover L / D | secondary-hover L / D |
|---|---|---|---|---|---|
| `color-system-green-*` | Up · buy · profit · success | `#3B7B62` / `#488A6F` | `#E9F1EE` / `#0B1D16` | `#4FAE85` / `#63A087` | `#DAECE2` / `#1C4433` |
| `color-system-red-*` | Down · sell · loss · failure | `#CF323F` / `#DE4551` | `#FBE9EA` / `#220B0E` | `#E5686E` / `#F5666C` | `#F9DEE0` / `#5E1823` |
| `color-system-purple-*` | Ceiling price (giá trần) | `#7D3FA7` / `#9C63C5` | `#F3ECF8` / `#160C1D` | `#9857BC` / `#B584D3` | `#EADBF3` / `#3A1C50` |
| `color-system-cyan-*` | Floor price (giá sàn) | `#0E849F` / `#1195B4` | `#E2F2F6` / `#071619` | `#2AAFC7` / `#3AAFC9` | `#D2F1F6` / `#0B3A47` |
| `color-system-blue-*` | Info / notification (Popup docs 2077:2413) | `#336DC1` / `#467AC6` | `#ECF4FF` / `#071120` | `#4A86DC` / `#6495DD` | `#D8E8FF` / `#163158` |
| `color-system-orange-*` | Warning (Popup docs 2077:2413). ⚠️ In VNDS same values as brand orange | `#E77500` / `#FF8A2B` | `#FFF0E7` / `#250F02` | `#F8862B` / `#FFAA72` | `#FFE1CF` / `#602D00` |

> ⚠️ In VNDS, `system-orange` is identical to `brand-primary`. Figma says brand orange must never signal market state. Figma Popup docs use `system-orange` for **Warning** and `system-blue` for **Notification/Info** (2077:2413). Never use `system-orange` for up/down.

Reference price (giá tham chiếu, usually yellow/orange in VN boards) has no documented token. TODO: do not invent one; ask the design team.

## Contrast check (WCAG 2.2 AA)

Computed on `base` / `canvas` / `surface`. Required: text ≥ 4.5:1, icons and interactive borders ≥ 3:1 (Figma 1218:299).

| Pair | Light | Dark | Result |
|---|---|---|---|
| text-primary | 19.4 / 18.1 / 16.9 | 14.1 / 13.4 / 12.6 | ✅ |
| text-secondary | 6.6 / 6.2 / 5.7 | 5.2 / 4.9 / 4.6 | ✅ |
| text-tertiary | 4.1 / 3.8 / 3.6 | 2.9 / 2.8 / 2.6 | ❌ fails for normal text |
| border-focus | 4.1 / 3.8 / 3.6 | 1.6 / 1.6 / 1.5 | ❌ dark fails 3:1 |
| brand-primary as text | 3.0 / 2.8 / 2.6 | 7.8 / 7.4 / 6.9 | ❌ light fails for normal text |
| `text-inverse` (#FFF) on brand-primary | 3.0 | 2.4 | ❌ white label on orange button fails 4.5:1 |
| system-green / red primary | 5.0 / 4.7 / 4.4 | 4.5 / 4.3 / 4.0 | ⚠️ fails on surface (light) and in dark |
| system-cyan primary | 4.4 / 4.1 / 3.8 | 5.2 / 5.0 / 4.6 | ⚠️ fails in light |
| system-purple primary | 6.7 / 6.2 / 5.8 | 4.4 / 4.2 / 3.9 | ⚠️ fails in dark |

These are token-level issues in Figma/ds-one, reported to the design team. **Following Figma:** use the tokens as defined, but avoid known failing pairs where an alternative exists (e.g. use `text-secondary` instead of `text-tertiary` for small important text).
