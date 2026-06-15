# Multi-Agent Debate — Reference

## Prompt Templates

Each template has a blank version and a filled example. Fill from your own analysis context.

### Defender Prompt
```
You are the DEFENDER for this hypothesis. Find the strongest possible evidence.

## Hypothesis
[one paragraph describing what you believe is true and why]

## Existing Evidence
[list with sources, e.g.:
- <key-observation-1> [<logfile-A>:<line>]
- <key-observation-2> [<logfile-B>:<line>]
]

## Your Tasks
1. For each claim, find direct physical evidence (file:line, command output, or code)
2. Identify the 3 most attackable points — collect pre-emptive counter-evidence
3. Verify: do ALL affected samples follow the same pattern?

## Output Format (per claim)
Claim: ...
Evidence: [source + verbatim content]
Confidence: HIGH / MEDIUM / LOW
Pre-emptive counter: [for the most likely attack]
```

**Filled example (architecture mismatch crash):**
```
You are the DEFENDER for this hypothesis: "x64 emulated <AppName> on ARM64
machines auto-updates via <x64-channel>, downloads the x64 installer,
which installs broken arm64 payload containing x64 <native-module>.node."

## Existing Evidence
- process.arch=x64 at <time> [<logfile-A>:<line>]
- channel=<x64-channel> [<logfile-A>:<line>]
- temp-<AppInstaller-x64>.exe in pending dir [<logfile-A>:<line>]
- after restart: process.arch=arm64 --updated [<logfile-B>:<line>]

## Your Tasks
1. For each claim, find direct physical evidence (file:line, command output)
2. Verify all affected samples follow the same x64→arm64 transition pattern
3. Identify 3 most attackable points and pre-collect counter-evidence
```

---

### Challenger Prompt
```
You are the CHALLENGER for this hypothesis. Find every hole.

## Hypothesis
[one paragraph]

## Your Tasks
1. For each claim: can another mechanism explain it equally well?
2. Flag every claim backed by only one sample → label as weak evidence
3. Find every [INFERENCE] being used as [FACT]
4. For every alternative hypothesis you propose, also provide how to falsify it

## Output Format (per dispute)
[CHALLENGE N]
Claim: ...
Hole: ... (specific, not just "lacks evidence")
Alternative: ...
How to falsify alternative: [specific command or file path]
Verdict: CONFIRMED HOLE / PARTIALLY VALID / CHALLENGE FAILS
```

---

### Evidence Hunter Prompt
```
You are an EVIDENCE HUNTER. Find measurable facts only. No inference.

## Questions to Investigate
[2-3 specific questions derived from disputed claims, e.g.:
Q1: In sample <sample-id>, what is process.arch immediately before and after
    the update? (check <logfile-before> and <logfile-after>)
Q2: What is the MD5 of <native-module>.node in <payload-A>/ vs <payload-B>/
    inside <installer-package>?
]

## Rules
- Every answer must come from a command output or code verbatim
- [INFERENCE] is forbidden
- Tag each fact: [SUPPORTS hypothesis] / [CHALLENGES hypothesis] / [NEUTRAL]

## Output Format (per question)
Question: ...
Fact: [verbatim or command output]
Source: [file:line or command]
Tag: [SUPPORTS/CHALLENGES/NEUTRAL]
```

---

## Evidence Priority (High → Low)

1. Command output (`file`, `md5`, `grep`, `cat`)
2. Source code (function definition, config file)
3. Log verbatim (with filename + line number)
4. Multi-sample statistics (≥3 independent samples)
5. Single-sample inference → `[INFERENCE:N=1]`
6. Verbal description / design intent (lowest credibility)

---

## Common Traps

| Trap | Symptom | Fix |
|------|---------|-----|
| Challenger over-rejects | Proposes alternative with no evidence | Require challenger to provide equally strong evidence for their alternative |
| Defender confirmation bias | Only finds supporting evidence | Ask defender to also list the weakest link in their evidence chain |
| User verbal claim accepted as fact | "X doesn't happen" → not checked in code | Any non-physical claim requires code/binary verification |
| Single-sample generalization | 1 log sample → conclusion | Tag `[INFERENCE:N=1]`, reduce weight |
| Over-long inference chain | A→B→C→D all inferences | Find ONE measurable anchor point in the chain |

---

## Arbitration Decision Tree

```
Dispute raised
    ↓
Can a command directly verify it?
  YES → Run command, output = verdict
  NO  → Is it directly readable in source code?
           YES → Read code, verbatim = verdict
           NO  → Is there a physical file to inspect?
                    YES → Inspect file, result = verdict
                    NO  → Mark [UNRESOLVED], exclude from conclusion
```

---

## Integration with Other Workflows

| Workflow | When to hand off to debate |
|----------|---------------------------|
| `solve-workflow` Phase 1.2 | Analysis relies on >2 inference steps |
| `solve-workflow` Phase 3 | Proposed solution has competing mechanisms |
| `debug-workflow` | After 2 failed fix attempts — hypothesis is wrong |
| `diagnose` | Single hypothesis; use debate when 2+ hypotheses compete |

---

## Convergence Checklist

Before writing the final conclusion, verify:

- [ ] Every conclusion has a `[FACT:source]` tag
- [ ] All `[UNRESOLVED]` items are excluded from the conclusion
- [ ] Challenger's strongest objection has been answered with physical evidence
- [ ] No "user said X therefore X" reasoning in any conclusion
- [ ] Corrected mistakes are documented with the evidence that overrode them
