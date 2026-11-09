---
title: Variable Usage
category: guidelines
figma_page: "↳ Variable Guideline"
figma_nodes:
  variable_architecture: "1190:3"
  collections: "1190:125"
  naming_and_code_syntax: "1191:2"
  add_new_brand: "1191:245"
  add_new_token: "1192:2"
  usage_and_review: "1192:151"
last_synced: 2026-11-09
status: summary
---

# Variable Usage

Summary of the Figma Variable Guideline (nodes above), cut down to what UI code needs. The designer-side steps (creating a brand, scopes, Figma tables) are left out; open the Figma nodes for those.

## Layers

```
Foundation (raw values)  →  Brand (mode per brand: VNDS, DSB)  →  Theme (Light · Dark)  →  UI
```

| Layer | Holds | May UI code use it? |
|---|---|---|
| Foundation | Raw scales: `color-<scale>-<light\|dark>-<step>`, font sizes, line heights, `spacing-*`, `radius-*` | Colors **no**. `spacing-*` / `radius-*` yes |
| Brand | `brand-theme-map-*` (color per role per brand), `brand-typography-*`, `brand-shape-*`, `brand-spacing-textbox-*` | `brand-theme-map-*` **no**; the others only through text styles and components |
| Theme | 46 role tokens: `color-background-*`, `color-text-*`, `color-border-*`, `color-brand-*`, `color-system-*` | **Yes: the only colors UI may use** |

Example chain (VNDS, Light): `color-background-surface` → `brand-theme-map-background-surface-light` → `color-neutral-light-0` → `#FFFFFF`.

Two independent switches, set once on the outermost element: **brand** = `data-brand` (`vnds` production, `dsb` demo for testing) and **theme** = `data-theme` (`light` / `dark`). Never fork styles per brand.

## Naming and web syntax

- Figma name `Color/background/surface` → code `var(--color-background-surface)`: lowercase, `/` → `-`. Brand-group styles get the `brand-` prefix; Foundation, Theme and component tokens get none.
- These docs write names neutrally: `color-background-surface` (no `--`, no `$`).
- Theme tokens are named by role, never by value (`color-background-surface`, not `gray-100`).
- Never put a brand name in a token or class (`vnds-…`, `dsb-…`).
- iOS uses camelCase (`SpacingTokens.spacing16`); Android uses PascalCase constants (`SpacingTokens.Spacing16`).

## New tokens

Figma adds a token only for a new role that no existing token can express, with values for every brand, Light and Dark, and code syntax for WEB / iOS / Android (Figma's example: `color-text-link`, not created yet).

**Agents never create tokens.** Reuse a token with the same meaning. If none fits, leave a `TODO` and propose the role (name, Light/Dark intent) to the design system team.

## Review (code equivalent of 1192:151)

- No hex / rgb literals in styles.
- No `var(--color-<scale>-…)` and no `var(--brand-theme-map-…)` in product components.
- Every text element uses a text-style class.
- Test with each `data-brand` value and both themes: no broken color, no missing font, text readable on its background, borders and icons visible.

Related: [tokens/color.md](../tokens/color.md) · [foundations/color.md](../foundations/color.md)
