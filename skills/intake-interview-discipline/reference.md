# Intake Interview Discipline — Templates

Support file for SKILL.md. Hosts point here for the three artifacts this skill produces; they never inline these templates.

## Frozen-decisions block (rides the host contract: engine output contract / queue task card)

```
## Frozen decisions (intake)
- Chosen approach: <one line> (comparison table recorded at: <where>)
- Resolved tickets: <ticket → decision, one per line>
- Deferred tickets: <ticket — reason>
- Initial assumptions: <assumption — impact if wrong>
- Pre-launch self-review: pass (gaps fixed: ...) / blocking doubt raised to human: <what>
```

## Runtime ticket report (clean stop)

```
## Clean-stop ticket <id>
- Task: <host task/card slug>
- What happened: <frozen approach falsified / unanswerable blocker>
- Evidence: <command output / file refs / observed behavior>
- Options: A <trade-off> / B <trade-off> / C <trade-off>
- Recommended: <option + one-line rationale>
- State at stop: <safe-point description — no half-edits, budget respected>
```

## Acceptance ledger

| Field | Meaning |
|---|---|
| Id | running number |
| Decision / question | what came up mid-run |
| Context | why it arose (task + trigger) |
| Chosen answer | what the run did |
| Rationale + evidence | why; link/line refs |
| Confidence | high / medium / low |
| Impact if wrong | high / medium / low |
| Status | open / accepted / overturned by human |

**Surfacing rule at acceptance** (hosts restate only this line): unresolved + low-confidence + high-impact entries go to the human; the rest are listed for spot-check.
