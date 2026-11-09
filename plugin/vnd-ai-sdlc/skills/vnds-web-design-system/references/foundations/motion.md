---
title: Motion
category: foundations
source: Figma intent (689:29385, 1218:168, 689:33354) + values adopted from the first implementation (VNDS website project)
last_synced: 2026-11-09
status: draft
notes: Figma has no motion values and ds-one has no motion tokens yet. The values below are provisional.
---

# Motion

## Figma intent (verbatim)

- "Màu sắc, hình ảnh và chuyển động được sử dụng tiết chế." (Understated Modernity, 689:29385)
- "Câu chữ ngắn, thân thiện; hướng dẫn theo ngữ cảnh; chuyển động nhẹ." (Approachable, 1218:168)
- Mobile: "Danh sách liền mạch, vùng chạm thoải mái và chuyển động nhẹ giúp thao tác tự nhiên." (689:33354)

## Provisional values ⚠️

| Token | Value |
|---|---|
| `--duration` | `200ms` |
| `--easing` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Reveal offset | 16 (= `spacing-16`) |

Not a Figma/ds-one token yet. Define them once per project (CSS variables + a JS mirror if a motion library is used) and never repeat the raw values in components.

## Rules

1. Use only `--duration` / `--easing`. Never set custom durations or easings in a component.
2. Animate only `opacity` and `transform` (x, y, scale). Do not animate width, height, top/left or background color on large elements.
3. Respect `prefers-reduced-motion` (CSS media query, and the motion library's reduced-motion setting).
4. Do not animate LCP content (hero `<h1>`, hero image, logo).
5. Animations must not hide or change text content (SEO, no-JS fallback).
6. Reveal on scroll plays once.

## Hover / press feedback ⚠️

Figma direction is flat: no shadows to separate regions, restrained motion, selected states shown by background. A "Lift" hover (translateY + bigger shadow) with `scale(0.97)` press is **not** part of the Figma system.

**Provisional (follow Figma):**
- Library components (ds-one Button, Tabs, Segment…) use their built-in states. Do not add hover, lift or shadow classes.
- A lift effect is allowed only on custom clickable elements that are *not* inside dense data UIs, and only if the project already defines it as a utility. Never on WebTrading table rows, lists or panels.
