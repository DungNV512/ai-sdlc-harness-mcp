# Integration Design template

`schema: vnd.ai-sdlc.integration-design/v1`

The other half of C1: the contracts this client consumes. Every `IR-NNN`
integration rule in the BRD should appear here as a concrete contract, or as
an explicit statement that no contract exists yet.

**Contracts are consumed, not designed here.** API contracts are read
read-only from the existing API documentation. Where the contract this work
needs does not exist, that is a finding and a dependency on another team —
not licence to invent the shape you would prefer.

```markdown
# Integration Design — <initiative>

- **Architect**: <name>   **Date**: <YYYY-MM-DD>   **Version**: 1.0
- **Sources**: BRD (IR rules) <link> · Systems & Projects Context <link>

## Contracts consumed

| # | System | Endpoint / operation | Contract source | Owner (other side) | Confirmed |
|---|---|---|---|---|---|
| 1 | <named system> | | <link to API docs> | <team, person> | <date + who> |

**"Confirmed" means a person on the owning side agreed the contract is
current and will not change under us.** A link to documentation is not
confirmation; documentation goes stale silently.

## Per-contract detail

For each contract:

- **Request shape**: <cited from the docs, not reconstructed from memory>
- **Response shape**: <including the error responses, which are the ones
  nobody reads until production>
- **Auth**: <scheme, where the credential comes from, which `SR-NNN` covers it>
- **Rate limits / quotas**: <or "not documented — asked <who> on <date>">
- **Idempotency**: <safe to retry? what happens if the client retries after a
  timeout with no response?>
- **Versioning**: <how the other side signals a breaking change, and how we
  would find out>

## Failure modes

| Contract | Failure | How the client degrades | User-visible result |
|---|---|---|---|

<Every integration fails eventually. A design that has not said what the app
does when the identity service is down has deferred that decision to whoever
is on call.>

## Contracts needed but absent

| What is needed | Which IR rule needs it | Owning team | Requested | Blocks |
|---|---|---|---|---|

<This table being empty is a claim. Make sure it is true.>

## Data ownership

| Entity | System of record | Who may write | Cached here? | Staleness tolerated |
|---|---|---|---|---|
```

## DoD

- **Every API contract confirmed with the owning side** — a person, a date,
  not a documentation link.
- Every `IR-NNN` rule from the BRD appears here, satisfied or listed as
  blocked.
- Error responses documented, not just success shapes.
- Failure degradation defined for every contract.
