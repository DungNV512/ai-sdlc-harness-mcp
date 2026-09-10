# Threat Model

`vnd.ai-sdlc.threat-model/v1`

Produced at **C5**, from C1 (Package + Integration Design) and C2 (Function
List + SRS). Lives on the repo plane — `docs/specs/<slug>/threat-model.md` —
not Confluence: it is read by engineers and reviewers alongside the code, not
by a C-level at a gate. Driven by `/security-review` and the
`threat-modeling` skill. See `docs/ai-sdlc/stage-c-design.md`.

---

schema: vnd.ai-sdlc.threat-model/v1
slug: <feature-slug>
owner: <FS 14 AppSec name>
based_on:
  c1: <link to Package/Integration Design>
  c2: <link to Function List/SRS>

## Method

STRIDE per feature — one pass per component named in C1/C2, not one pass for
the whole feature. A component with no row below was not modelled, not
"modelled and found clean."

## Components in scope

- <component 1 — e.g. "client → API gateway">
- <component 2>
- <...>

## Findings

One row per (component, STRIDE category) combination that applies. Omit a
category only when it genuinely does not apply to that component, and say
why inline rather than leaving the row out silently.

| Component | Category (STRIDE) | Attack | Mitigation | Residual risk | Severity |
|---|---|---|---|---|---|
| <component> | Spoofing | <how an attacker could> | <what stops it> | <what remains> | Critical / High / Medium / Low |
| <component> | Tampering | | | | |
| <component> | Repudiation | | | | |
| <component> | Information disclosure | | | | |
| <component> | Denial of service | | | | |
| <component> | Elevation of privilege | | | | |

## Risk acceptance

Every residual risk above `Low` needs an explicit acceptance, not a silent
carry-forward.

| Finding | Residual risk | Accepted by | Date | Follow-up |
|---|---|---|---|---|
| <finding> | <severity> | <FS 14 AppSec name, or C-level for Critical> | <YYYY-MM-DD> | <ticket, or "none — accepted as-is"> |

## Done when

- A security requirement exists for every component listed above (not just
  the ones with a finding — "no requirement needed" is itself a stated
  conclusion, not silence).
- Every finding carries a severity.
- Every residual risk above Low has a **signed** acceptance row — a
  mitigation plan with no sign-off is not risk acceptance.
