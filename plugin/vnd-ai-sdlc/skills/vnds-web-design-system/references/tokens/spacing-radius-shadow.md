---
title: Spacing, Radius & Shadow Tokens
category: tokens
source: "@vnd/ds-one package, dist/tokens/foundation.css + shadow.css + component.css"
source_package: "@vnd/ds-one 0.0.2 (dist/tokens/)"
last_synced: 2026-11-09
status: draft
---

# Spacing, Radius & Shadow Tokens

Token names are **in px** (`spacing-16` = 16px). This is different from Tailwind defaults (`p-4` = 16px): ds-one's `tailwind.css` removes the Tailwind default scale, so `p-8` = 8px.

## Spacing

`spacing-{0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 30, 32, 36, 40, 44, 48, 56, 64, 72, 80, 96, 120}`

- CSS: `var(--spacing-16)` · Tailwind (ds-one `tailwind.css`): `p-16`, `gap-24` · iOS `SpacingTokens.spacing16` · Android `SpacingTokens.Spacing16`
- Off-grid values `2, 6, 10, 14, 18, 30` exist although the Style Document says "lưới 4px". Prefer multiples of 4; use 2px only for the WebTrading panel gap.

Values used by the Style Document ([spacing-layout](../foundations/spacing-layout.md)):

| Use | Token |
|---|---|
| Mobile horizontal padding | `spacing-8` |
| WebTrading panel padding | `spacing-8` |
| WebTrading gap between panels | `spacing-2` |
| Mobile section spacing | `spacing-32` |

## Radius

`radius-{0, 2, 4, 6, 8, 10, 12, 14, 16, 20}`, `radius-1000` (pill)

- Tailwind (ds-one `tailwind.css`): `rounded-8`, `rounded-1000`
- ds-one implementation: **VNDS button = `radius-4`, card/panel = `radius-8`** ⚠️ This conflicts with the Figma Style Document (edge-to-edge panels have no radius; "bo góc mềm 8–12px"). Not confirmed yet. Provisional: keep the ds-one component defaults.

| Shape role (1220:168) | Suggested token | Source |
|---|---|---|
| Edge-to-edge region (panel, section, list) | `radius-0` | Figma |
| Tag, small status label | `radius-4` or `radius-1000` (pill) | derived |
| Button, input, chip | `radius-4` (ds-one default) vs 8–12 (Figma) ⚠️ | not confirmed; keep ds-one default |
| Overlay: Popup Desktop / Modal | `radius-12` | Figma 2074:3077 |
| Overlay: Popup Mobile | `radius-16` | Figma 2074:3077 |
| Overlay: bottom sheet | TODO (Bottom sheet page not read) | — |
| Avatar, ticker logo, status dot | `radius-1000` | Figma (circle) |

## Shadow

| Token | Value |
|---|---|
| `shadow-sm` | `0 1px 3px rgba(13,13,13,.1), 0 1px 2px -1px rgba(13,13,13,.1)` |
| `shadow-md` | `0 4px 8px -2px rgba(13,13,13,.1), 0 2px 4px -2px rgba(13,13,13,.06)` |
| `shadow-lg` | `0 12px 16px -4px rgba(13,13,13,.08), 0 4px 6px -2px rgba(13,13,13,.03)` |
| `shadow-illustration-glass` | `0 6px 14px rgba(0,0,0,.1), inset 0 4px 7.1px rgba(13,13,13,.25)` + `effect-glass-blur: 26px` |

Figma rule: **no shadows to separate regions** and "không shadow nặng". Popup/Modal also have **no shadow** (separated by `color-background-overlay`, see [components/modal.md](../components/modal.md)). Use shadows only for small floating layers such as dropdowns, popovers and the mega menu (derived).

## Component tokens

Only Toggle tokens exist so far (`component.css`: "chờ designer export collection component"):

| Token | Value |
|---|---|
| `toggle-sm-container-gap` / `toggle-md-container-gap` | `spacing-8` / `spacing-12` |
| `toggle-track-radius` | `radius-1000` |
| `toggle-track-padding` | 2px |
| `toggle-sm-track-width × height` | 36 × 20 |
| `toggle-md-track-width × height` | 44 × 24 |

> ⚠️ Bug in ds-one: these tokens are scoped to `[data-brand='vndss']` instead of `'dsb'`, so they do not apply under the DSB demo brand. Reported; do not work around it in product code.
