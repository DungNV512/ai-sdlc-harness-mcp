---
description: Regenerate retrofit + freezed clients from the OpenAPI spec.
argument-hint: [<feature-slug>]
allowed-tools: Bash, Read, Write, Edit, Glob
---

# /api-from-openapi $ARGUMENTS

Invokes the `openapi-codegen` skill.

## Steps

1. Resolve OpenAPI source. Order of precedence:
   - `docs/api/openapi.yaml` in repo, or
   - URL configured in `.env.codegen` (`OPENAPI_URL=`).
2. For each `<feature>` (or `$ARGUMENTS` if scoped):
   - Diff existing `modules/<name>/lib/src/<f>/data/datasource/<f>_api.dart`
     against the spec.
   - Regenerate request/response DTOs as Freezed classes under
     `modules/<name>/lib/src/<f>/data/dto/`.
   - Update the Retrofit abstract class signature.
3. Run `dart run build_runner build --delete-conflicting-outputs`.
4. Run `/test` for the affected feature.
5. Fail loudly if a breaking change is detected (removed field,
   renamed endpoint). Require a follow-up ADR.
