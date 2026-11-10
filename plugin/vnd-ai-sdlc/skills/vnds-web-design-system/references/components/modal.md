---
title: Modal & Popup
category: components
figma_page: "↳ Modal (934:8)"
figma_nodes:
  docs_construction: "2074:3077"
  docs_variant: "2077:2413"
  popup_set: "2055:2944"
  modal_set: "2055:3054"
  featured_icon_set: "1617:505"
code: "@vnd/ds-one Popup, Modal (API: api/popup.md, api/modal.md)"
last_synced: 2026-11-09
status: summary
---

# Modal & Popup

Usage rules from the Figma docs frames above. The generated API is in [api/modal.md](api/modal.md) and [api/popup.md](api/popup.md).

## Popup or Modal

| | **Popup** | **Modal** |
|---|---|---|
| Purpose | Report a result, quick confirmation | Show or collect custom content without leaving the page |
| Parts | Top (Header + Close) · Footer | Top · **Content** · Footer |
| Featured icon | Yes, by State | Off by default |
| Width | Mobile 359 (centered) · Desktop 452 (span 3, left-aligned) | Small 452 · Medium 608 · Large 764 (span 3 / 4 / 5) |
| On mobile | Popup Mobile | **Never** a Modal: use a Bottom sheet |
| Examples | Order placed, session about to expire, cancel failed | Order confirmation with details, transfer form, advanced filters |

Quick pick: 1–2 sentences + buttons → Popup; input or details → Modal.

## Mandatory rules

1. Use the library component; change title, supporting text, checkbox and labels through its props. Never rebuild it.
2. State changes **only the Featured icon glyph color**. Primary button is always **Primary · Brand**, secondary **Subtle**. No negative/destructive button inside Popup/Modal.
3. Container `color-background-canvas`, **no shadow**; `color-background-overlay` behind it separates it from the page.
4. Light/Dark comes from the page theme, never set per dialog.
5. Height hugs the content; width is fixed per size.

## Spec

| Property | Popup Mobile | Popup Desktop | Modal |
|---|---|---|---|
| Padding Y / X | `spacing-12` / `spacing-8` | `spacing-12` / `spacing-8` | `spacing-16` / `spacing-8` |
| Gap Top · Content · Footer | `spacing-12` ⚠️ | `spacing-12` ⚠️ | `spacing-12` ⚠️ |
| Radius | `radius-16` | `radius-12` | `radius-12` |
| Title | `webtrading-body-2-highlight` (16/22), center | `webtrading-body-1-highlight` (20/28), left | as Desktop |
| Supporting text | `webtrading-body-3-normal`, `color-text-secondary` | same | same |
| Featured icon | 40, glyph 28 | 36, glyph 24 | off by default |
| Buttons | Regular (40), Fill | Compact (36), Hug, right-aligned | as Desktop |

⚠️ **Gap:** Figma's token column says `spacing-12`, its value column says 24. Use `spacing-12` until design confirms.

- All padding belongs to the container (the parts have none), so turning Header / Content / Footer off keeps the rhythm.
- Top: Close button sits next to the Header, gap `spacing-8`; Header gaps: icon ↔ text `spacing-12`, title ↔ supporting `spacing-8`. Popup Mobile adds a 32px spacer left of the text so it stays centered.
- ⚠️ **Close** is 32px, below the 40px mobile touch target. Keep the 32px look and extend the hit area to 40px.
- Text: title max 2 lines, supporting max 3 lines, then "…". Text styles are `webtrading-*` on every platform, as Figma says (not confirmed for WebInfo).
- Content (Modal): replace the slot with the real content (form, table, list); the content owns its own padding.
- Footer: Desktop has the checkbox on the left of the same row; Mobile puts it on its own row above, and buttons always fill. Checkbox label `webtrading-body-3-medium`, gap `spacing-8`; gaps checkbox ↔ actions and between buttons `spacing-12`.

## Popup variants

| State | Featured icon intent · glyph | Glyph color | When |
|---|---|---|---|
| Notification | Info · `notification-3-line` ⚠️ | `color-system-blue-primary` | Neutral info: fee update, reminder, system news |
| Success | Positive · `check-line` | `color-system-green-primary` | Action done: order placed, deposit succeeded |
| Warning | Warning · `alert-line` | `color-system-orange-primary` | Attention before continuing: session expiring, limit exceeded |
| Fail | Negative · `close-line` | `color-system-red-primary` | Action failed: order error, connection lost. Say how to fix it |

⚠️ The Featured icon set has no "Notification" intent; use **Info**. Icon background is `color-background-surface` in every state.

| Actions | Desktop | Mobile | When |
|---|---|---|---|
| Fill (default) | 2 equal buttons | 2 equal buttons | Two peer choices |
| Stacked | vertical, primary on top | same | Long labels, or to stress the primary |
| Right | Hug, right-aligned, checkbox on the same row | shown as Fill | Desktop with a "Don't show again" checkbox |

Turn the secondary action off when no choice is needed (Success with only "Đóng").

## Modal sizes

| Size | Width | When |
|---|---|---|
| Small | 452 | Confirmation with 1–2 extra lines, form with 1–3 fields |
| Medium | 608 | Multi-field form, order details, short list |
| Large | 764 | Data table, comparison, two-column content |

Divider: Figma turns it on for long or scrolling content. ⚠️ ds-one's `divider` prop does nothing (bug). Instead, add a 1px `color-border-subtle` line above and below the content inside the content slot.

## Content

| Part | Rule | Do | Avoid |
|---|---|---|---|
| Title | Short, states the result or the question. Max 2 lines | "Đặt lệnh thành công" | "Thông báo", 3-line titles |
| Supporting text | Context and result of the action. Max 3 lines | "Lệnh mua 1.000 VND30 đã được gửi." | Lists, tables, long links (use a Modal) |
| Primary button | Specific verb | "Đặt lệnh", "Tiếp tục" | "OK", "Có" |
| Secondary button | Close / cancel, no side effect | "Huỷ", "Để sau" | Two primary actions |
| Checkbox | Only for repeating notices | "Không hiển thị lại" | Accepting terms |

## Code notes

- ds-one is built on Radix Dialog: `role="dialog"`, `aria-modal`, focus trap, focus restore and Esc come built in. Use the title as the dialog title and the supporting text as its description.
- Mapping Figma → props (sizes, states, actions, header type, footer layout, breakpoint): see the "Figma → API" line in [api/modal.md](api/modal.md) and [api/popup.md](api/popup.md).
