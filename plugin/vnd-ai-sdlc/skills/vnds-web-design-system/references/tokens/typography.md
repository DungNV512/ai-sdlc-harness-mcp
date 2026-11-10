---
title: Typography Tokens (Text styles)
category: tokens
source: "@vnd/ds-one package, dist/tokens/typography.css + foundation.css + brand.css (generated from Figma text styles)"
source_package: "@vnd/ds-one 0.0.2 (dist/tokens/)"
last_synced: 2026-11-09
status: draft
---

# Typography Tokens (Text styles)

Use a **text style role** for every text element. Never set font size, line height or weight manually.

- CSS: `--typography-<role>` (font size) with `--typography-<role>--line-height`, `--font-weight`, `--letter-spacing`
- Tailwind (ds-one `tailwind.css`): `text-<role>`, e.g. `text-mobile-title`, `text-website-body-2-medium`, `text-webtrading-body-3-highlight`
- Font family comes from the brand: `--brand-typography-family` (VNDS = IBM Plex Sans, DSB demo = Inter). Tailwind: `font-plain` (ds-one); a project may also map `font-sans` to IBM Plex Sans.
- Letter spacing is `0px` for every role.

## Weights

| Token | Value | Suffix in role name | Use |
|---|---|---|---|
| `brand-typography-weight-regular` | 400 | `-normal` | Content |
| `brand-typography-weight-prominent` | 500 | `-medium` | Labels |
| `brand-typography-weight-emphasis` | 600 | `-highlight`; all display/heading/title roles | Headings, key numbers, emphasis |

Only **400 / 500 / 600** exist. No Light, no Bold (700). Confirmed by the production tokens.

## Base scale (Foundation)

| Size token | Size | Line height |
|---|---|---|
| `font-size-normal-sm` | 10 | 14 |
| `font-size-normal-md` | 12 | 14 |
| `font-size-normal-l` | 14 | 18 |
| `font-size-normal-lg` | 16 | 22 |
| `font-size-normal-xl` | 20 | 28 |
| `font-size-large-sm` | 24 | 32 |
| `font-size-large-md` | 28 | 36 |
| `font-size-large-lg` | 32 | 40 |
| `font-size-large-xl` | 40 | 48 |
| `font-size-hero-sm` | 48 | 56 |
| `font-size-hero-md` | 56 | 64 |
| `font-size-hero-lg` | 64 | 72 |

## Text style roles per platform

Body and caption roles come in 3 weights: `-normal` (400), `-medium` (500), `-highlight` (600).

| Level | Website (WebInfo) | WebTrading | Mobile | Size / LH |
|---|---|---|---|---|
| Display 1 | `website-display-1` | — | — | 64 / 72 · 600 |
| Display 2 | `website-display-2` | — | — | 56 / 64 · 600 |
| Heading 1 | `website-heading-1` | — | — | 48 / 56 · 600 |
| Heading 2 | `website-heading-2` | — | — | 40 / 48 · 600 |
| Title 1 / Display | `website-title-1` | `webtrading-display` | `mobile-display` | 32 / 40 · 600 |
| Title 2 / Heading | `website-title-2` | `webtrading-heading` | `mobile-heading` | 28 / 36 · 600 |
| Title 3 / Title | `website-title-3` | `webtrading-title` | `mobile-title` | 24 / 32 · 600 |
| Body 1 | `website-body-1-*` | `webtrading-body-1-*` | `mobile-body-1-*` | 20 / 28 |
| Body 2 | `website-body-2-*` | `webtrading-body-2-*` | `mobile-body-2-*` | 16 / 22 |
| Body 3 | `website-body-3-*` | `webtrading-body-3-*` | `mobile-body-3-*` | 14 / 18 |
| Caption | `website-caption-*` | `webtrading-caption-*` | `mobile-caption-*` | 12 / 14 |
| Tiny | — | `webtrading-tiny-*` | — | 10 / 14 |

## Mapping to the Style Document hierarchy (derived)

| Hierarchy level ([typography](../foundations/typography.md#hierarchy)) | Mobile | WebTrading |
|---|---|---|
| 1 · Main number (asset value 32px SemiBold) | `mobile-display` | `webtrading-display` |
| 1 · Price (20px SemiBold) | `mobile-body-1-highlight` | `webtrading-body-1-highlight` |
| 2 · Region title, ticker | `mobile-body-2-highlight` / `mobile-title` | `webtrading-body-3-highlight` |
| 3 · Values in tables/lists | `mobile-body-3-normal` / `-highlight` | `webtrading-caption-normal` / `webtrading-body-3-normal` |
| 4 · Labels & metadata (not bold) | `mobile-caption-normal` | `webtrading-tiny-normal` / `webtrading-caption-normal` |

> The 32px and 20px values come from Style Document 1218:168. The other rows are suggestions; confirm with the design team (not confirmed yet).

## Text box padding (brand)

Components bind directly to these to correct text alignment per font (1190:125).

| Token | VNDS | DSB (demo) |
|---|---|---|
| `brand-spacing-textbox-regular-top` | 0 | 0 |
| `brand-spacing-textbox-regular-bottom` | 2 | 0 |
| `brand-spacing-textbox-large-top` | 2 | 0 |
| `brand-spacing-textbox-large-bottom` | 4 | 0 |
