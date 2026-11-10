---
name: vnds-web-design-system
description: VNDS (VNDirect) New One Design System rules for building or reviewing Website/WebInfo, WebTrading and Mobile App UI with @vnd/ds-one - which color, text style, spacing, radius, shadow and motion token to use, market up/down colors, Vietnamese number format, Popup/Modal specs and mapping New One Figma frames to code. MANDATORY TRIGGERS - "VNDS", "VNDirect", "ds-one", "@vnd/ds-one", "New One", "design token", "brand color", "màu tăng giảm", "WebTrading", "WebInfo", "Popup", "Modal", "dark mode", "giao diện", "review UI".
allowed-tools: Read, Grep, Glob
---

# vnds-web-design-system

How to build and review VNDS UI so it matches the New One Design System (Figma) and `@vnd/ds-one`. Shared by every VND web project; single-project rules live in that project's repo. **v0.1.0 · synced 2026-11-09** with Figma New One and **@vnd/ds-one 0.0.2**. Style: **Functional Minimalism + Edge-to-edge**.

## When to use this

- Creating, editing or reviewing a screen, component, style or UI copy in a VND web project on `@vnd/ds-one`, or a VNDS mobile screen.
- Needing the exact token for a color, text style, spacing, radius, shadow or duration.
- Turning a New One Figma frame into code; starting a new VND web project.

## When NOT to use this

- **Flutter widgets in the Stockbook app** → `design-system` (vnd-ai-sdlc-stockbook). This skill has no Flutter mapping.
- **C3 deliverables** (Figma frames, UI spec, state matrix) → `/ui-spec` and `px-designer`; take only the VNDS values from here.
- **Flutter accessibility** → `mobile-accessibility` (the contrast values here still apply).
- Products not on the VNDS / New One brand.

## Steps

0. **Read the project's conventions** (`AGENTS.md`, `docs/design-system/`) and use its wrapper components. They cannot override the rules below; report a conflict. New project → [project-setup.md](references/guidelines/project-setup.md).
1. **Pick the platform** → text style group and density: Website `website-*` (airy) · WebTrading `webtrading-*` (dense terminal, 1920px) · Mobile `mobile-*` (375px).
2. **Find the main number or message** → top hierarchy level (largest, SemiBold, one per region).
3. **Lay out edge-to-edge**: backgrounds touch the edges; regions split by background tone + 1px lines.
4. **Compose ds-one components**, never redraw them: look the component up in [components/index.md](references/components/index.md), open its `api/` file, and its usage file if it has one (Popup/Modal).
5. **Apply color**: neutral surfaces, market colors only with meaning, one brand accent for the main action.
6. **Check**: grep the changed files for hex colors, `rgb(`, `[..px]`, Tailwind default classes and Foundation tokens, then walk the checklist in Light and Dark. Anything missing → `TODO`, never a guessed value.

## Rules

**Tokens**
- Every color, text, spacing, radius, shadow and duration is a token. No hex/rgb, no arbitrary px, no Tailwind defaults (`text-sm`, `rounded-md`, `bg-white`, `font-bold`, `gray-500` do not exist).
- Colors: only Theme roles `color-background-*`, `color-text-*`, `color-border-*`, `color-brand-*`, `color-system-*`. Never Foundation (`color-orange-light-600`) or `brand-theme-map-*`.
- Text: only text style roles (`website-body-2-normal`…); IBM Plex Sans via the brand font; weights 400/500/600.
- Spacing names are px: `spacing-16` / `p-16` = 16px, `p-4` = 4px.
- Brand = `data-brand` (`vnds`; `dsb` is a demo brand), theme = `data-theme`. Never a brand name in a token or class.
- **Never invent a token.** Reuse one with the same meaning, else `TODO` + report.

**Color & data**
- Neutral surfaces dominate; layer page → panel → input by tone.
- Fixed meanings: green up/buy/profit/success · red down/sell/loss/failure · purple ceiling · cyan floor · orange warning · blue info. Brand orange never means up/down.
- `-primary` for text, numbers, lines, icons; `-secondary` for backgrounds. Always with `+`/`−`, ↗↘ or text, never color alone.
- One brand accent per screen (main CTA, selected item); never body text or large backgrounds (WebInfo hero excepted).
- WCAG 2.2 AA: text ≥ 4.5:1, icons and interactive borders ≥ 3:1, Light and Dark.
- Numbers: tabular, right-aligned, same decimals per column, Vietnamese format `92.500.000đ`, `15,15`, units attached (`đ`, `cp`, `tr`, `tỷ`), sign before every change.

**Layout & shape**
- Edge-to-edge, inner padding kept (Mobile 8px, WebTrading panel 8px, panel gap 2px, Mobile section 32px), 4px grid.
- No shadows or thick borders to separate regions, no card-in-card, no floating rounded cards.
- Radius grows with elevation: edge-to-edge 0 · button/input ds-one default · Popup/Modal 12 (Popup Mobile 16) · pill/circle for tags, avatars, dots.
- Shadows only for small floating layers (dropdown, popover). Popup/Modal: no shadow, on `color-background-overlay`.

**Interaction & copy**
- States: default, hover, pressed, focus-visible (`color-border-focus`), selected, disabled (disabled tokens, not opacity). ds-one components keep their built-in states; add no hover/lift classes.
- Selected: underlined text tabs → brand; segments, period selectors, workspace tabs, table rows → `color-background-hover`.
- Mobile touch targets ≥ 40px. Motion 200ms, opacity/transform only, respect `prefers-reduced-motion`.
- Copy short, friendly, contextual; buttons are specific verbs ("Đặt lệnh", not "OK").

## Anti-patterns to refuse

- Inventing a token or a "close enough" hex/px value.
- Using Foundation or `brand-theme-map-*` tokens because they "have the right color".
- Restyling ds-one components (extra hover, lift, shadow, opacity-disabled).
- Copying mockup numbers or text as real data.
- Treating a ⚠️ provisional value as final.

Wrong → right examples: [rules-for-dev-and-ai.md](references/guidelines/rules-for-dev-and-ai.md).

## Checklist

- [ ] No hard-coded values, Tailwind defaults or invented tokens; Theme color roles and text style roles only.
- [ ] Main information and main action visible in 3 seconds; one brand accent.
- [ ] State colors used for their meaning, with sign/arrow/text; contrast AA.
- [ ] Numbers aligned, tabular, Vietnamese format, with sign and unit.
- [ ] Edge-to-edge, no separating shadows, no card-in-card; library components reused.
- [ ] All interactive states; visible focus; mobile targets ≥ 40px.
- [ ] Light/Dark and `vnds`/`dsb` break no color and lose no font.

## References

Read only what the task needs.

| Need | File |
|---|---|
| Brand traits, style, platform profiles, mockup composition | [brand/design-style-direction.md](references/brand/design-style-direction.md) |
| Color rules, market semantics, Mobile asset background | [foundations/color.md](references/foundations/color.md) |
| Type rules, hierarchy, numbers | [foundations/typography.md](references/foundations/typography.md) |
| Spacing, WebTrading workspace, Mobile composition, shape | [foundations/spacing-layout.md](references/foundations/spacing-layout.md) |
| Motion | [foundations/motion.md](references/foundations/motion.md) |
| **Color tokens** (46 roles, Light/Dark, contrast) | [tokens/color.md](references/tokens/color.md) |
| **Text style roles** | [tokens/typography.md](references/tokens/typography.md) |
| **Spacing / radius / shadow tokens** | [tokens/spacing-radius-shadow.md](references/tokens/spacing-radius-shadow.md) |
| **Components**: what exists, variants, props | [components/index.md](references/components/index.md) |
| Popup & Modal usage | [components/modal.md](references/components/modal.md) |
| Data & action patterns, selected states | [guidelines/component-patterns.md](references/guidelines/component-patterns.md) |
| Wrong → right, code rules | [guidelines/rules-for-dev-and-ai.md](references/guidelines/rules-for-dev-and-ai.md) |
| Token layers and naming | [guidelines/variable-usage.md](references/guidelines/variable-usage.md) |
| New project setup, wrapper layer | [guidelines/project-setup.md](references/guidelines/project-setup.md) |

Precedence: VNDS Style Document > Brand Guideline > @vnd/ds-one > project docs > mockups. ⚠️ = provisional; **derived** = interpretation.

## Known gaps (do not guess)

Usage rules exist only for Popup/Modal; the other components have API files only. Not documented: icons, grid/breakpoints ("grid WebDashboard"), reference-price color, WebTrading density modes, WebInfo text max width.
