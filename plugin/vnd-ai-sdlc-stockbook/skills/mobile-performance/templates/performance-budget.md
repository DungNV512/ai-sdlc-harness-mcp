# Performance budget — mobile app template

Copy this into your project's docs and fill in measured actuals. Revise
after each major release.

## Frame budget by device tier

| Tier | Example | Hz | Budget | Target |
|------|---------|----|--------|--------|
| High-end | iPhone 15 Pro, Pixel 8 Pro | 120 | 8.3 ms | ≤ 6 ms |
| Mid-range | Pixel 7, Galaxy A54 | 60 | 16.7 ms | ≤ 12 ms |
| Low-end | Pixel 4a, Galaxy A32 | 60 | 16.7 ms | ≤ 14 ms |

## Cold start budget

| Metric | Target | Hard limit |
|--------|--------|------------|
| Cold start → first list item visible (mid-tier) | < 2,500 ms | < 3,500 ms |
| Cold start → first list item visible (high-end) | < 1,500 ms | < 2,000 ms |
| Warm start (app in background, resumed) | < 1,500 ms | < 2,000 ms |
| Deferred library load (heavy/rarely-used flow) | < 500 ms | < 1,000 ms |

## Surface-specific frame budgets (profile mode, mid-range device)

Replace the example surfaces below with your app's actual screens.

| Surface | First paint | Steady scroll frame |
|---------|------------|---------------------|
| Primary list/feed | ≤ 1,500 ms | ≤ 12 ms |
| Primary list first cell fully rendered | ≤ 1,800 ms | — |
| Detail screen open | ≤ 1,200 ms | ≤ 12 ms |
| Live-updating card tick | — | ≤ 4 ms |
| Chat/thread open | ≤ 800 ms after route push | ≤ 12 ms |
| Composer sheet open | ≤ 250 ms | ≤ 16 ms |
| Profile page open | ≤ 1,000 ms | ≤ 12 ms |

## Memory budget

| Metric | Target |
|--------|--------|
| RSS after 100 list items (mid-tier) | < 200 MB |
| Image cache ceiling | 200 MB (set in bootstrap.dart) |
| Local DB open footprint | < 20 MB |

## Network budget

| Metric | Target |
|--------|--------|
| Data per 1-hour active session | ≤ 30 MB |
| List page payload (30 items) | ≤ 80 KB (JSON, gzip) |
| Push notification payload | ≤ 4 KB |

## Crash / ANR budget

| Metric | Target | Alert threshold |
|--------|--------|-----------------|
| Crash-free sessions | > 99.5% | < 99.5% pages on-call |
| ANR rate | < 0.1% | > 0.1% pages on-call |

## Jank budget

| Metric | Target |
|--------|--------|
| Primary list scroll jank rate (frames > 16 ms) | < 2% on mid-tier |
| Compositor-thread jank | < 1% |

## CI performance gates

- Integration test: no frame > 16 ms on the primary scroll path (mid-tier
  emulator, `--profile`).
- Startup test: cold start under your hard limit on a low-end device
  (nightly, not per PR).
- Memory test: RSS under target after 100 items (nightly).
