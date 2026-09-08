---
description: Threat-model the current diff (STRIDE) and run the security checklist.
argument-hint: [<feature-slug>]
allowed-tools: Read, Grep, Glob, Bash, Edit
---

# /security-review $ARGUMENTS

Delegates to the `security` subagent. Invokes `threat-modeling` skill.

## Steps

1. Identify the diff scope. Required if it touches: auth, tokens,
   secure-storage mechanisms, the network client / interceptors,
   deep links, WebViews, file pickers, third-party SDKs. (Stockbook's
   overlay names these specifically: `flutter_secure_storage`,
   `dio`.)
2. Walk `docs/ai-sdlc/security-checklist.md` end to end.
3. Apply prompt **P8** (STRIDE). Output table:

   | category | actor | attack | mitigation | residual (L/M/H) | follow-up |

4. For each `H` residual, open a ticket stub in PR body and
   refuse to advance until justified or fixed.
5. Append a "Security note" paragraph (<= 120 words) to the PR body.

## Mandatory output

- Checklist results
- STRIDE table
- Residual risk summary
- Action items (with owners, if known)
