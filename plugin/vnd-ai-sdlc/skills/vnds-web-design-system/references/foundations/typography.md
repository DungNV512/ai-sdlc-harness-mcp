---
title: Typography
category: foundations
figma_page: "↳ Brand Guideline + VNDS Style Document"
figma_nodes:
  selection_criteria: "689:931"
  direction_and_font: "689:15406"
  letterform_comparison: "689:23340"
  numerals_and_symbols: "689:25402"
  style_doc_typography: "1218:467"
last_synced: 2026-11-09
status: summary
---

# Typography

How to use type. Text style roles and sizes: [tokens/typography.md](../tokens/typography.md).

## Rules

1. **IBM Plex Sans** for all UI text on all three platforms (through the brand font token / `font-plain`). Roboto is legacy; never mix families or use system fonts, which blur 0/O and 1/I/l.
2. Use the library **text styles per platform** (Website, Webtrading, Mobile). Never set font, size or weight by hand.
3. Build hierarchy with **size, weight and spacing**, not with boxes, colors or other fonts. In edge-to-edge layouts, type is what separates content instead of containers.
4. Weights: **Regular 400** for content; **Medium 500** and **SemiBold 600** for labels, headings and highlights. No Light, no Bold 700.
5. Legible on desktop and mobile, light and dark, with clear Vietnamese diacritics at small sizes.

## Hierarchy (1218:467)

| Level | Content | Style |
|---|---|---|
| 1 · Main number | Asset balance, current price | Largest on the screen, SemiBold. **One per region.** (e.g. asset value 32px, price 20px) |
| 2 · Region title | Section or panel name, ticker | SemiBold, medium size. Replaces a border to separate regions |
| 3 · Value | Numbers in tables and lists | Regular or SemiBold, small, `color-text-primary`, right-aligned |
| 4 · Label & metadata | Column headers, units, time, helper text | Smallest, 1–2 steps lighter in color, never bold |

## Numbers and data

| Rule | Detail |
|---|---|
| Tabular figures | `font-variant-numeric: tabular-nums` on every numeric column, so digits keep the same width and do not shift on update |
| Alignment | Numbers right-aligned, labels left-aligned; same number of decimals in a column |
| Format | Vietnamese: dot for thousands, comma for decimals (`92.500.000đ`, `15,15`). Units attached: `đ`, `cp`, `tr`, `tỷ` |
| Signs | Always `+` or `−` before a change; percentages with ↗↘ and the state color |
| Symbols | `+ − %`, decimal separator and currency must stay clearly visible |

The Brand Guideline samples (`3,141.596`) are glyph samples only; the Vietnamese format above is the rule.
