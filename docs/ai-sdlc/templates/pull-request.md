<!--
schema: vnd.ai-sdlc.pull-request/v1

The PR body is the artefact of the PR phase; the commit is only the record.
Every section below is required. A section that does not apply is filled in
with "N/A — <reason>", never deleted: a missing section is indistinguishable
from a forgotten one, and a reviewer cannot tell which.

Fill the placeholders and delete these comment blocks.
-->

Refs: <TICKET-KEY>
<!--
The ticket this work is accountable to. If the tracker was unreachable when
this PR was opened, write `PENDING — <one-line reason>` and say in the body
who has to create it. Never silently omit the line: a PR that quietly lost
its compliance link is worse than one that says the link is missing.
-->

## Summary

<!-- One paragraph. Why this change exists, not what files moved. -->

## What changed

<!--
The substance. For a change to a plugin, name the plugin and the version
transition explicitly, e.g. "vnd-ai-sdlc 0.3.0 -> 0.4.0". A plugin change
without a version bump reaches nobody -- see /skill-approve.
-->

## Verified

<!--
Evidence, not assertion. Each line cites the command and what it returned.
"Tests pass" is not evidence; `npm test` -> 42 passing is.
-->

## Not verified

<!--
REQUIRED, and the most important section here. Anything that could not be
checked, and why. A check that did not run is reported as "did not run",
never as passed and never as failed on its merits. If everything was
verified, write "Nothing — every claim above was executed."
-->

## Risk and rollback

<!-- What breaks if this is wrong, and the concrete way back. -->

## Screenshots / recording

<!-- Mandatory for any user-visible change. Otherwise: "N/A — no UI change." -->

## Security note

<!--
What this touches in auth, network, storage, secrets or PII. Otherwise:
"N/A — no auth/network/storage touched."
-->

## Links

<!--
Manifest (`docs/specs/<slug>/traceability.yaml`), spec, ADR, upstream
sources and tasks. Unknown entries are written as "none", never guessed.
-->
