---
description: Write the functional + technical spec for a feature.
argument-hint: <feature-slug>
allowed-tools: Read, Grep, Glob, Write, Edit
---

# /spec $ARGUMENTS

Phase 2. Requires `docs/specs/<slug>/plan.md` to exist.

## Steps

1. Read the plan and its `traceability.yaml`; if either is missing, instruct
   the user to run `/plan-feature` after intake and stop.
2. Verify source IDs and task IDs in the manifest before using any API or
   product rule. Treat uncited details as open questions.
3. Apply prompt **P2** (layered design).
4. Write `docs/specs/<slug>/spec.md`:

   ```
   # <Feature> — Spec

   ## Screens & states
   For each screen list: route, entry points, loading / empty /
   error / success states, key widgets, analytics events.

   ## Navigation map
   ASCII diagram or bullet list of transitions.

   ## Domain
   Entities, value objects, usecases (signatures only), failures.

   ## Data
   - REST endpoints: METHOD path, request schema, response schema,
     status codes, caching policy.
   - Local persistence: secure_storage / shared_prefs / files.

   ## i18n keys
   - feature.<screen>.<element> = "vi text" / "en text"

   ## Non-functional
   - a11y, perf budget, offline behaviour, observability.

   ## Failure modes
   Table: failure | trigger | UX | recovery.

   ## Out of scope
   ```

5. List i18n keys explicitly so `/i18n` can extract them.
6. Cross-link to ADRs needed (run `/adr` next if architectural) and preserve
   the distinction between upstream contract facts and team decisions.

## DoD reminder

Every screen state has UI, every API call has request + response,
analytics + i18n keys named.
