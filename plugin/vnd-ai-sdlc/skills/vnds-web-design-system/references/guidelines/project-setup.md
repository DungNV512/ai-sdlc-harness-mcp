---
title: Using the design system in a VND web project
category: guidelines
platform: Website / WebInfo, WebTrading (any VND web project on @vnd/ds-one)
source: "@vnd/ds-one 0.0.2 package (exports, peer dependencies) + practice from existing VND web projects"
last_synced: 2026-11-09
status: derived
---

# Using the design system in a VND web project

The design system is **shared across all new VND web projects**. This file covers what every project needs, whatever it builds. Rules that belong to **one** project (its wrapper names, its own utilities, its content structure) live in that project's own repo, not in this skill.

> **Derived.** Nothing here is in Figma. It comes from the ds-one package and from how the first projects set it up. The Figma rules and token files still win.

## 1. Setup (from the ds-one package)

- Stack ds-one expects: **React 19 + Tailwind CSS 4** (peer dependencies). Components are built on Radix.
- Tokens: import the bundle once in the global CSS, and let Tailwind scan ds-one's classes:

  ```css
  @source "../node_modules/@vnd/ds-one/dist";
  @import "@vnd/ds-one/tokens.css"; /* foundation, brand, theme, tailwind, typography, shadow, component */
  ```

  Single files are also exported (`@vnd/ds-one/tokens/theme.css`…), but the bundle keeps the layers in the right order.
- Brand and theme go on the root element: `<html data-brand="vnds" data-theme="light">`. `dsb` is a demo brand for testing only; `data-theme="dark"` switches to Dark.
- ds-one's Tailwind removes the default palette, type scale and spacing. Spacing is named in px (`p-16` = 16px). See the [token files](../tokens/color.md).
- Class merging: use `cn` from `@vnd/ds-one/utils/cn`, which is set up for the token class names, rather than a plain `tailwind-merge`.

### Make the skill available to the whole team

Commit `.claude/settings.json` in the project repo, so that Claude Code offers to install this skill's plugin to everyone who opens the repo. Merge it into the existing file if there is one. ⚠️ The plugin name `vnd-ai-sdlc-web` is provisional.

```json
{
  "extraKnownMarketplaces": {
    "ai-sdlc-harness-mcp": { "source": { "source": "github", "repo": "DungNV512/ai-sdlc-harness-mcp" } }
  },
  "enabledPlugins": { "vnd-ai-sdlc-web@ai-sdlc-harness-mcp": true }
}
```

Then add one line to the project's `AGENTS.md` / `CLAUDE.md`: UI follows the `vnds-web-design-system` skill, and the project's own conventions are in `docs/design-system/project-conventions.md` (see section 3).

## 2. Component layer (recommended)

- **ds-one is the only UI library.** Do not add antd, MUI, shadcn or similar next to it.
- Wrap ds-one in one project folder (for example `components/ui/`). The rest of the app imports only from that folder. This keeps a project API stable when ds-one changes.
- New component: wrap the ds-one one. Write a custom component only when ds-one has none, and build it from tokens and the rules in this skill.
- A wrapper may rename props (`variant="primary"` → ds-one `variant="primary" intent="brand"`), but it must not change visuals: no extra shadow, lift, colors or radius on top of ds-one.
- Known ds-one behaviour (0.0.2):
  - Link that looks like a button: `Button` has `asChild` (Radix Slot) in 0.0.2, or apply ds-one's variant helpers (`buttonVariants`, `buttonTextboxVariants`, `iconButtonVariants`) to the framework `Link`. ⚠️ Some projects note that `asChild` with their framework `Link` did not work for them; test it, and fall back to the helpers.
  - The variant helpers live in a `'use client'` module, so any component that calls them must be a client component.
  - The Modal `divider` prop renders nothing. See [components/modal.md](../components/modal.md).
  - Toggle component tokens use `[data-brand='vndss']`, so they do not apply under `dsb`. See [tokens/spacing-radius-shadow.md](../tokens/spacing-radius-shadow.md).

## 3. Project-only values

Each project may add a few values of its own, such as a hero image scrim, a motion library setup or a mega-menu shadow. When it does:

- Document them in the project repo (`AGENTS.md` or `docs/design-system/`), with what they are used for.
- Build them from tokens where possible. A raw value needs a comment saying why no token fits, plus a request to the design team for a token.
- They must not break the mandatory rules in `SKILL.md`. For example, no weight 700 and no Inter. A project rule that conflicts with this skill is a bug to report, not an override.

Precedence inside a project: this skill's mandatory rules and token values > the project's own conventions (wrapper names, utilities, folders) > generic framework habits.

## 4. Other shared conventions

- Brand logos come from files shipped in the project, never from a CDN or a third-party URL.
- Motion: see [foundations/motion.md](../foundations/motion.md). Any motion library is fine, but hover, pressed and focus states stay in CSS, and `prefers-reduced-motion` is respected globally.
- Numbers and dates are formatted in Vietnamese in one shared helper, not per component. See [guidelines/component-patterns.md](component-patterns.md).

## 5. Checks

Run the project's own lint, typecheck and build, then walk the checklist in `SKILL.md`. Imports of `@vnd/ds-one` outside the wrapper folder are a review finding.
