# Essence Diagnosis — Output Templates and Format Reference

> This file is the output-template library for the `essence-diagnosis` skill. SKILL.md references the templates here and does not repeat format details in its body.

## 1. SOAP diagnosis report template

```markdown
# [Problem title] Essence Diagnosis Report

## S — Subjective (information field)

### Information source inventory
| Source type | Location | Scale | Noise assessment |
|-------------|----------|-------|------------------|
| Logs | path/to/log | N lines | High/Medium/Low |
| Code | src/module | N files | Low |
| Metrics | dashboard url | N metrics | Medium |

### Denoised objective facts
- [FACT:file:line] specific fact statement
- [FACT:cmd] key fact from command output
- [FACT:N samples] statistical fact across N samples

## O — Objective (multiple hypotheses + evidence chains)

### Hypothesis list (≥3)
| ID | Hypothesis statement | VINDICATE category | Supporting evidence | Counter-evidence | Confidence |
|----|----------------------|--------------------|---------------------|------------------|------------|
| H1 | ... | Version | N | M | High |
| H2 | ... | Interaction | N | M | Medium |
| H3 | ... | Environment | N | M | Low |

### Evidence chain for H1 (Toulmin 6 elements)
- **Claim**: the root cause is X
- **Data**: [FACT:file:line] specific evidence
- **Warrant**: how the data leads to the claim (the logical bridge)
- **Backing**: the background basis for the warrant (mechanism/principle)
- **Qualifier**: holds under condition Y
- **Rebuttal**: may not hold in situation Z

(Expand H2, H3 the same way)

## A — Assessment (logic chain + bias counter-attack)

### Logic chain (fault tree)
```
[Observed phenomenon]
  ↑ [evidence E1]
[Intermediate event A]
  ↑ AND [evidence E2, E3]
[Intermediate event B]
  ↑ OR [evidence E4 / E5]
[Root cause candidate]
  ⚠️ Weakest link: E4 is a single sample
```

### Bias counter-attack checklist
| Bias type | H1 | H2 | H3 |
|-----------|----|----|----|
| Confirmation bias | ✅ 2 counter-evidence items listed | ... | ... |
| Premature convergence | ✅ all walked through | ... | ... |
| Anchoring effect | ✅ hypotheses formed only after S | ... | ... |
| Correlation as causation | ✅ mechanistic explanation present | ... | ... |

### Weakest links (2-3, the targets for debate)
1. <link>: why it is weak (single sample? long inference chain? no counter-evidence?)
2. <link>: ...

### Physical verification design
| Conclusion | Verification command/experiment | Expected result |
|------------|--------------------------------|-----------------|
| ... | `grep ... / cmd ...` | ... |

## Debate conclusions (returned by multi-agent-debate)

### Confirmed Facts [FACT:source]
- ...

### Reasonable Inferences [INFERENCE]
- ...

### Unresolved Disputes (verification method needed)
- ...

---
⚠️ This report covers diagnosis only and has not entered the resolution phase. For a fix, hand off to solve-workflow or a specialized skill.
```

## 2. VINDICATE general taxonomy (adapted from medicine)

The medical VINDICATE is a mnemonic for etiology categorization. This skill abstracts it into a "problem-cause categorization mnemonic" that fits software / system / business problems:

| Letter | Medical original | General adaptation (software/system/business) | Investigation question |
|--------|------------------|----------------------------------------------|------------------------|
| **V** | Vascular | **Version** — version change | Any recent version / release / deployment change? |
| **I** | Infectious | **Interaction** — interaction issue | Is it a component / service / module interaction going wrong? |
| **N** | Neoplastic | **New** — newly introduced | Any new feature / dependency / data introduced? |
| **D** | Degenerative | **Degradation** — gradual degradation | Is it gradual worsening (leak / rot / accumulation)? |
| **I** | Idiopathic | **Idiopathic** — cause unknown | No clear cause found for now, needs deeper digging? |
| **C** | Congenital | **Congenital** — design flaw | Is it flawed by design (boundary / concurrency / fault-tolerance)? |
| **A** | Autoimmune | **Auto** — self-triggering / feedback loop | Is the system triggering itself / positive feedback out of control? |
| **T** | Traumatic | **Trigger** — external trigger | Triggered by external operation / traffic / fault injection? |
| **E** | Endocrine | **Environment** — environmental factor | Is it a config / network / permission / resource environment issue? |

> **How to use**: during hypothesis generation in phase O, ask once for each letter "could this class of cause apply?" to avoid missing an entire class of causes. This is an exhaustive tool against "only thinking of one class of cause".

## 3. Toulmin argument model

The evidence chain for each hypothesis must contain 6 elements:

| Element | Meaning | Example (memory-leak scenario) |
|---------|---------|--------------------------------|
| **Claim** | The conclusion you are trying to prove | "The root cause is a memory leak of object X" |
| **Data** | The raw evidence supporting the claim | `[FACT:heap_dump]` object X occupies 80% of heap and keeps growing |
| **Warrant** | How the data leads to the claim | "An object that keeps growing and is not collected by GC matches the signature of a leak" |
| **Backing** | The background basis for the warrant | "JVM GC mechanism: reachable objects are not collected; [FACT:config] shows X is statically referenced" |
| **Qualifier** | The scope within which the conclusion holds | "Holds under long-running (>24h) scenarios" |
| **Rebuttal** | Situations in which it may not hold | "Unless X is a bounded cache — but [FACT:config] shows no upper bound, so the rebuttal does not hold" |

> **Rebuttal is the most important** — it forces you to actively think "under what circumstances is this conclusion wrong". An evidence chain without a Rebuttal is self-persuasion, not diagnosis.

## 4. Evidence-chain table format

| Evidence ID | Content | Source tag | Type | Supports hypothesis | Refutes hypothesis |
|-------------|---------|------------|------|---------------------|--------------------|
| E1 | Symptom description | `[FACT:file:line]` | Log fact | H1, H2 | H3 |
| E2 | Command output | `[FACT:cmd]` | Command fact | H1 | - |
| E3 | Statistics | `[FACT:35 samples]` | Sample fact | H1, H3 | - |
| E4 | Inference | `[INFERENCE]` | Inference | H2 | H1 |
| E5 | To be verified | `[UNRESOLVED]` | To be verified | - | H3 |

**Evidence type semantics**:
- `FACT`: has an original text/output that can be quoted directly; not disputable
- `INFERENCE`: no original text but logically derived; must be tagged; easily challenged by debate
- `UNRESOLVED`: an assertion awaiting verification; cannot serve as the basis for a conclusion

## 5. Logic-chain / fault-tree format

Text representation (use a text tree when no diagramming tool is available):

```
[Observed phenomenon: service intermittent 500s]
  ↑ [evidence E1: error.log:142]
[Intermediate event A: DB connections exhausted]
  ↑ AND [evidence E2: connection-pool metrics] + [evidence E3: slow-query log]
[Intermediate event B: long transaction holding connections]
  ↑ OR [evidence E4: single-sample trace] / [evidence E5: inference]
[Root cause candidate: batch job has no timeout set]
  ⚠️ Weakest link: E4 only 1 trace sample
  ⚠️ Weakest link: E5 is an inference with no source text
```

**Rules**:
- Every arrow `↑` must be supported by at least 1 piece of evidence
- An arrow with no evidence is tagged `[UNVERIFIED]`; before debate it must be backfilled with evidence or flagged as a weakest link
- AND gates (all must hold) / OR gates (any one holds) must be labeled explicitly

## 6. multi-agent-debate handoff package format

Before invoking `multi-agent-debate`, this handoff package must be assembled as the input to the three debate agents:

```markdown
## Debate handoff package

### Primary hypothesis (one paragraph)
<the most likely root-cause hypothesis, stated in a full paragraph including the claim + qualifying conditions>

### Evidence list (each with a source tag)
1. [FACT:file:line] evidence content
2. [FACT:cmd] evidence content
3. [FACT:N samples] evidence content
4. [INFERENCE] inference content (explicitly tagged as inference)

### Weakest links (2-3)
1. <link 1>: why weak (single sample? long inference chain? no counter-evidence? mechanism unclear?)
2. <link 2>: ...
3. <link 3>: ...
```

Once packed, follow the "5-Step Flow" of the `multi-agent-debate` skill to launch the Defender / Challenger / Evidence Hunter agents, and fill their returned conclusions into the "Debate conclusions" section of the SOAP report.

**One-way orchestration constraint**: this skill → debate; debate does not call back into this skill. If disputes remain unresolved after debate, return to phase O of this skill to supplement hypotheses/evidence, re-pack the handoff package, and re-run debate.
