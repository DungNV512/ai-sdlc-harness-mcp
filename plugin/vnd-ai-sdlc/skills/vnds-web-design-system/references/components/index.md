---
title: Component index — @vnd/ds-one 0.0.2
category: components
source: "@vnd/ds-one 0.0.2 type declarations + system-ui-26 verify specs (Figma axes, node ids)"
generated: 2026-11-09 by a maintainer script — do not edit by hand, re-generate
status: generated
---

# Component index — @vnd/ds-one 0.0.2

Every component the library ships, one file per component in `api/` (open only the one you need). **Use these before writing your own.** Generated from the published package (API) and the library's Figma verification specs (axes, node ids, Figma → API mapping).

How to read it:
- **Exports** are the names to import (through the project's wrapper layer if it has one).
- **Axis** values are the Figma variant axes as the code spells them. Pick the variant by its meaning in the design, never by look alone.
- **Props** list the public API. Internal props (Figma node ids, story-only state, `className`, `children`, `asChild`) are left out.
- **Figma → API** is the library's own note on how each Figma property maps to code.
- Interaction states (hover, pressed, focus, disabled) are built in. Do not add classes for them.
- A component with **Usage rules** has a detailed file. For the others, apply the general rules in [component-patterns.md](../guidelines/component-patterns.md) and leave a `TODO` for anything the design must decide.

⚠️ The specs come from the library's working repo and can lag behind the published package. When a spec value disagrees with the package or Figma docs, the package and Figma win (example: the Modal spec lists old widths 560/400/359; package and Figma use 452/608/764).

| Component | Exports | Figma | Usage rules |
|---|---|---|---|
| [Accordion](api/accordion.md) | 5 | set `950:113` | — |
| [Alert](api/alert.md) | 1 | spec | — |
| [AlertBanner](api/alertbanner.md) | 1 | spec | — |
| [Avatar](api/avatar.md) | 4 | set `938:57` | — |
| [Badge](api/badge.md) | 3 | page `817:35248` · set `1484:12503` | — |
| [BottomSheet](api/bottomsheet.md) | 4 | — | — |
| [Breadcrumbs](api/breadcrumbs.md) | 7 | set `953:81` | — |
| [Button](api/button.md) | 1 | set `1462:15992` | — |
| [Card](api/card.md) | 1 | spec | — |
| [Chart](api/chart.md) | 15 | — | — |
| [Checkbox](api/checkbox.md) | 2 | spec | — |
| [Chip](api/chip.md) | 1 | set `1510:568` | — |
| [DatePicker](api/datepicker.md) | 1 | — | — |
| [Divider](api/divider.md) | 1 | spec | — |
| [Dock](api/dock.md) | 3 | set `956:115` | — |
| [DropdownMenu](api/dropdownmenu.md) | 12 | page `934:7` · set `940:132` | — |
| [EmptyState](api/emptystate.md) | 3 | spec | — |
| [FeaturedIcon](api/featuredicon.md) | 1 | page `934:8` · set `1617:505` | — |
| [Field](api/field.md) | 18 | set `1554:3094` | — |
| [IconButton](api/iconbutton.md) | 1 | set `1462:15992` | — |
| [InlineMessage](api/inlinemessage.md) | 1 | spec | — |
| [Logo](api/logo.md) | 1 | — | — |
| [Menu](api/menu.md) | 12 | — | — |
| [Modal](api/modal.md) | 19 | page `934:8` · set `1610:971` | [modal.md](modal.md) |
| [NavMenu](api/navmenu.md) | 2 | — | — |
| [Overlay](api/overlay.md) | 1 | — | — |
| [Pagination](api/pagination.md) | 1 | page `919:2` · set `927:557` | — |
| [Popup](api/popup.md) | 6 | — | — |
| [Progress](api/progress.md) | 2 | — | — |
| [Radio](api/radio.md) | 2 | spec | — |
| [Segment](api/segment.md) | 3 | set `961:117` | — |
| [Select](api/select.md) | 1 | — | — |
| [SettingPanel](api/settingpanel.md) | 14 | — | — |
| [SideMenu](api/sidemenu.md) | 7 | — | — |
| [Skeleton](api/skeleton.md) | 2 | spec | — |
| [Slider](api/slider.md) | 5 | spec | — |
| [Stepper](api/stepper.md) | 3 | — | — |
| [Table](api/table.md) | 20 | page `919:2` · set `1727:6598` | — |
| [Tabs](api/tabs.md) | 6 | set `937:157` | — |
| [Tag](api/tag.md) | 7 | page `1432:24363` · set `1497:13562` | — |
| [Toast](api/toast.md) | 2 | spec | — |
| [Toggle](api/toggle.md) | 1 | spec | — |
| [Tooltip](api/tooltip.md) | 11 | page `934:3` · set `936:58` | — |
| [Uploader](api/uploader.md) | 3 | spec | — |

## Specs without a matching package file

Charts and parts that are composed inside other components: `BarChart`, `DonutChart`, `Icon`, `OrderBookRow`, `PriceChart`, `Sparkline`.
