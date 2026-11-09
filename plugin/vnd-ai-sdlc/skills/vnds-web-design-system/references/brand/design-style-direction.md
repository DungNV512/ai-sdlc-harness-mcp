---
title: Brand & Design Style Direction
category: brand
figma_page: "↳ Brand Guideline + VNDS Style Document"
figma_nodes:
  personality: "689:29385"
  overview_and_webinfo: "689:31351"
  webtrading: "689:35388"
  mobile_app: "689:33354"
  style_doc: "1218:168"
  mockups: "689:4875, 689:9019, 689:12581"
last_synced: 2026-11-09
status: summary
---

# Brand & Design Style Direction

**Functional Minimalism + Edge-to-edge:** lean, seamless, content-first. Background and data regions extend to the screen edges, nested cards are avoided, and text and controls keep their inner padding. Same font and tokens on all platforms; they differ in density and how much brand color they use.

## Brand traits → UI (1218:168)

Use the traits as the tie-breaker when no specific rule applies.

| Trait | Means | UI rules |
|---|---|---|
| **Trustworthy** | Clear, transparent, consistent; users always know what is happening | Right-aligned tabular numbers; fixed state colors (green up/buy/profit, red down/sell/loss) always with `+`/`−` or ↗↘; show system state (loading, success, error, order status); make fees, risks and outcomes explicit before confirming |
| **Understated Modernity** | Lean, purposeful, detailed; color, imagery and motion used sparingly | Neutral background dominates; one brand accent per screen; no heavy shadow, no card-in-card, no decoration |
| **Professional** | Precise, structured, clear feedback | Hierarchy by size and weight; 4px grid, every gap a spacing token; dense data aligned in columns |
| **Approachable** | Plain language, friendly interaction, timely help | Mobile touch targets ≥ 40px; soft radius; short, friendly, contextual copy; explain jargon in context; light motion |

## Do / avoid

| Principle | Do | Avoid |
|---|---|---|
| Edge-to-edge | Backgrounds, panels and lists span the full width; inner padding kept (Mobile 8px, WebTrading panel 8px) | Floating rounded cards, card-in-card, a border around every block |
| Separate by tone and lines | Two slightly different background tones (page / panel), 1px lines, 2px gap between WebTrading panels | Shadows or thick borders to separate regions |
| Type leads | Main numbers large (asset value 32px SemiBold, price 20px SemiBold); labels small and light | Images or decorative icons for emphasis |
| Selective accent | Brand color only on the main CTA, the selected tab, the main action icon | Many saturated colors competing; brand on body text or large backgrounds |

## Platform profile

| Platform | Density | Layout | Brand color |
|---|---|---|---|
| **Website (WebInfo)** | Airy; storytelling, products, conversion | Full-bleed hero, images and content bands; text blocks with a max width (TODO: value); generous whitespace; large headings and key numbers lead; one focal message and one CTA per section | Wider in intro and lead areas (hero, CTA) |
| **WebTrading** | Dense, terminal-style; price board, chart, order entry | Panels flush (2px gap), screen fully used; regions split by tone and thin lines; neutral palette, saturated color only for data and market state; numbers easy to compare; density adjustable (TODO: modes not defined) | Only CTA (Nộp tiền) and selected tab |
| **Mobile App** | Medium; assets, market movement, quick actions | Edge-to-edge with safe areas, horizontal padding 8px, section spacing 32px; seamless lists with dividers, not a card per row; assets, movement and main action visible at a glance | Main action (Giao dịch), selected tab, helper touch points |

Spacing values: [spacing-layout.md](../foundations/spacing-layout.md).

## Mockup composition (reference only)

Mockup data is placeholder and its number formats are wrong; use the structure, not the values.

- **WebInfo (DGO Compass):** top nav → hero (eyebrow, large heading, short text, one primary CTA, optional illustration) → result page with a large statement heading, sub-tabs, a card with one large key metric (92%), meaning chips and a secondary action, then a row of 4 metric tiles.
- **WebTrading (stock screen):** top bar (actions, market clock and status) · symbol header (ticker, price + change, performance periods) · chart (timeframes, line/candle, analysis tabs) · user order book (empty value `--`) · market depth with buy/sell ratio bar · time & sales · symbol info · dividends · order entry (account, Buy/Sell, order type, price, volume, quick %, validity, total, "Xem trước" + "Mua VND").
- **Mobile App:** asset header (large value, change vs yesterday, sub-account selector) · period tabs (1–90 days) · quick actions (Nộp tiền, Giao dịch, Rút tiền, Lịch sử) · portfolio lists grouped by product, each row ticker, quantity, value, % change, P/L · asset-state background ([color.md](../foundations/color.md)) · order screen like WebTrading's order entry.
