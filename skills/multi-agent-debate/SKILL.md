---
name: multi-agent-debate
version: "1.0.0"
user-invocable: true
description: "Stress-test an analysis or hypothesis with three adversarial agents — defend, attack, hunt new evidence — resolving disputes with physical proof. Use when 2+ competing explanations both seem plausible, or a conclusion rests on a single log or inferred chain. Triggers — 辩论、求真、挑战假设、质疑分析、multi-agent-debate, debate this, challenge my analysis, are you sure?"
---

# Multi-Agent Debate

> Core rule: **Reasoning disputes cannot be resolved by more reasoning. Only evidence arbitrates.**

## Quick Start

1. Write your hypothesis in one paragraph
2. List existing evidence (each with source: file, line, or command)
3. Identify 2–3 weakest links in your analysis
4. Fill in the three prompts below and launch in parallel

```
task(subagent_type="explore",  run_in_background=true, prompt="[DEFENDER]...")
task(subagent_type="oracle",   run_in_background=true, prompt="[CHALLENGER]...")
task(subagent_type="explore",  run_in_background=true, prompt="[EVIDENCE HUNTER]...")
```

**Why separate prompts?** Each agent must be blind to the others' goals — if the Challenger sees the Defender's framing, it anchors on the same assumptions it's supposed to attack. Fill in each prompt from [REFERENCE.md](REFERENCE.md) independently.

**Minimal prompt structure (fill in `<...>`):**

```
DEFENDER:   "You are the DEFENDER for: <hypothesis>. Find direct physical evidence
             (file:line, command output, code) for each claim. List the 3 weakest
             points and collect pre-emptive counter-evidence."

CHALLENGER: "You are the CHALLENGER for: <hypothesis>. Find holes: alternative
             explanations, single-sample claims, inferences used as facts. For
             every alternative you propose, provide how to falsify it."

HUNTER:     "Find facts only — no inference. Answer: <2-3 specific questions from
             disputed claims>. Every answer must be a command output or code verbatim.
             Tag each: [SUPPORTS] / [CHALLENGES] / [NEUTRAL]."
```

## Three Roles

| Role | Goal | Agent Type |
|------|------|-----------|
| **Defender** | Find strongest evidence for the hypothesis | `explore` |
| **Challenger** | Find holes, alternative explanations, single-sample claims | `oracle` |
| **Evidence Hunter** | Find new facts only — no inference allowed | `explore` |

## 5-Step Flow

1. **Prepare** — hypothesis + evidence list + 2-3 weakest links
2. **Launch** — all three agents in parallel (`run_in_background=true`)
3. **Triage** — split results into: agreed facts / disputed claims / new evidence
4. **Arbitrate** — for each dispute, find a command/file/code that directly resolves it; if only reasoning exists, mark `[UNRESOLVED]`
5. **Conclude** — write only what has physical evidence; disputed items stay pending

## Conclusion Format

```markdown
### Confirmed Facts [FACT:source]
### Reasonable Inferences [INFERENCE]
### Unresolved Disputes — verification method needed
### Corrected Mistakes — original → corrected | evidence
```

## Evidence Tags

`[FACT:file:line]` · `[FACT:cmd]` · `[FACT:N samples]` · `[INFERENCE]` · `[SPECULATION]` · `[UNRESOLVED]`

No bare claims in conclusions. Every statement needs a tag.

---

See [REFERENCE.md](REFERENCE.md) for full prompt templates with examples, common traps, arbitration decision tree, and evidence priority rules.
