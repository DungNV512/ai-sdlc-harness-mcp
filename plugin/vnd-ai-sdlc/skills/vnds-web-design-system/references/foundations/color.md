---
title: Color
category: foundations
figma_page: "↳ Brand Guideline + VNDS Style Document"
figma_nodes:
  selection_criteria: "689:2903"
  color_direction: "689:17381"
  brand_color_refinement: "689:19383"
  system_color_refinement: "689:21369"
  mobile_asset_overlay_rule: "689:12581"
  style_doc_color_usage: "1218:299"
last_synced: 2026-11-09
status: summary
---

# Color

How to use color. Token names and values: [tokens/color.md](../tokens/color.md). Never hard-code hex; the values below are for reference.

## Principles

- **Neutral surfaces dominate.** Layer page → panel → input by a slight tone change, not by color. Color is weighed by area and visual pull, not by how many colors are used; no fixed ratio per screen.
- **Brand orange** is saturated (S 100%) but used in a controlled scope: **one main accent per screen**, on the most important CTA and the selected item. Never for body text or large backgrounds. Per platform:
  - WebInfo: may use brand color more widely in intro and hero areas.
  - WebTrading: neutral background dominates; prominence goes to data and key actions.
  - Mobile App: accents on the main action, guidance and helper touch points.
- **System colors** have low saturation (about 30–70%) to feel neutral and serious, deliberately different from the brand.
- Keep **brand**, **data** and **system feedback** colors clearly separate.
- **Never color alone:** always pair with a label, an icon or a +/− / ↗↘ sign. Default, selected, active and disabled states must be distinguishable.
- **Contrast WCAG 2.2 AA:** text ≥ 4.5:1, icons and interactive borders ≥ 3:1, checked in Light, Dark and on dense data screens. Both themes are required.

## Market semantics (fixed on every platform, Vietnamese market convention)

| Meaning | Token family | Rule |
|---|---|---|
| Green: up · buy · profit · success | `color-system-green-*` | Always with `+` or ↗ |
| Red: down · sell · loss · failure | `color-system-red-*` | Always with `−` or ↘ |
| Purple: ceiling price | `color-system-purple-*` | Price labels; asset-state background when the portfolio has a ceiling stock |
| Cyan: floor price | `color-system-cyan-*` | Same, for floor |
| Brand orange: action | `color-brand-*` | Main action only, never up/down |

`-primary` (strong) for text, numbers, chart lines and icons; `-secondary` (light) for backgrounds. Orange (`system-orange`) = warning, blue (`system-blue`) = info.

## Core values (reference)

| Figma name | HEX | Note |
|---|---|---|
| `brand-light-orange` | `#E77500` | = token `color-brand-primary` Light. One frame says `#E5750A`: typo |
| `brand-dark-orange` | `#FF8A2B` | = `color-brand-primary` Dark |
| `text-light-primary` / `text-dark-primary` | `#0D0D0D` / `#E2E2E2` | |
| `brand-orange` (old) | `#F7941D` | ❌ deprecated |

⚠️ The Brand Guideline frame shows canvas `#FFFFFF` / `#0D0D0D`. The production tokens are `color-background-canvas` `#F7F7F7` / `#1A1A1A` and `color-background-base` `#FFFFFF` / `#151515`. **Use the tokens.**

## Mobile asset-state background

The top of the Mobile asset screen changes color with the user's assets today: up → green, down → red; if the portfolio has ceiling/floor stocks that day → purple / cyan.

| Part | Spec |
|---|---|
| Overlay | 375×311 at the top, linear gradient top → bottom: light state color → page background |
| Glow | Ellipse 247×147, layer blur ≈ 80, state color, behind the balance |
| Asset chart | 2px line in the strong state color; area below fades to transparent |
| Light / Dark | Same structure; colors come from the theme, never fixed in the gradient |

TODO: exact token names and the priority between states (e.g. up and ceiling on the same day) are not defined.
