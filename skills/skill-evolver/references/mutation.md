# Layered Mutation Strategy

## Contents
- Why Layers
- Three Layers (L1 Triggers, L2 SKILL.md Body, L3 Scripts/References)
- Cross-Layer Rules
- Priority Ladder (within any layer)
- Evidence-Based Mutation Protocol

## Why Layers

Not all mutations are equal. Changing a trigger keyword is cheap and low-risk. Rewriting a reference document is expensive and high-risk. The layered approach starts with the cheapest changes and only escalates when cheaper options are exhausted.

This is analogous to learning rate schedules — start with large, cheap adjustments, then fine-tune with smaller, more expensive ones.

## Three Layers

### Layer 1 — Triggers and Metadata

**What you can change:**
- SKILL.md frontmatter `description` (trigger keywords, phrasing)
- SKILL.md frontmatter `name` (rare, only if genuinely wrong)
- Trigger-related phrases in the first section of SKILL.md body

**What you cannot change:**
- SKILL.md body beyond the trigger/description section
- Any reference files
- Any scripts

**Cost:** Very low. Changes are small, easy to revert, low risk of breaking behavior.

**When to exhaust:** K consecutive discards at Layer 1 (K from evolve_plan.md, default 3). This means the skill's trigger quality is already good enough — problems lie deeper.

**Example mutations:**
- Add a missing trigger phrase: "also trigger on '优化技能'"
- Remove an over-broad trigger: remove "any code task" which causes false positives
- Reword description for clarity

### Layer 2 — SKILL.md Body

**What you can change:**
- SKILL.md instruction sections (not frontmatter)
- Add/remove/reorder instruction steps
- Rewrite decision trees and routing logic
- Add disambiguation hints, edge case handling
- Adjust output format instructions

**What you cannot change:**
- Reference files in `references/`
- Scripts in `scripts/`
- External dependencies

**Cost:** Medium. Changes affect how the skill executes. Each change should be testable against specific failing cases.

**When to exhaust:** K consecutive discards at Layer 2. This means the core instructions are solid — problems are in supporting materials.

**Example mutations:**
- Add a disambiguation hint: "When the user asks about '离职', check both 邮箱 and 通讯录 sections"
- Reorder steps to prioritize the most common path
- Add an edge case handler: "If input contains both X and Y, prefer X routing"
- Simplify a complex decision tree that's confusing the model

### Layer 3 — Scripts and References

**What you can change:**
- Reference files (`references/*.md`)
- Helper scripts (`scripts/*.py`, `scripts/*.sh`)
- Assets and templates
- Add new reference files or scripts

**What you cannot change:**
- Nothing is off-limits at this layer (except GT files — never modify GT to match the skill)

**Cost:** High. Reference files are loaded into context and affect all behaviors. Script changes can introduce bugs. Changes are harder to isolate.

**When to exhaust:** K consecutive discards at Layer 3 → evolution is complete. All layers have been tried.

**Example mutations:**
- Add a new reference document covering a knowledge gap
- Fix an incorrect fact in a reference file
- Add a routing index that helps the skill find the right reference
- Write a validation script that catches a specific error pattern

## Cross-Layer Rules

1. **Default: start at Layer 1 and progress sequentially.** The starting layer can be overridden in `evolve_plan.md` when baseline analysis shows a layer is irrelevant (e.g., triggers are already correct → start at Layer 2). Once a starting layer is chosen, do not skip forward — exhaust the current layer before promoting.
2. **Never cross layers in one iteration.** If you're at Layer 2, don't also change a reference file. Split into two iterations.
3. **Layer promotion requires L3 evaluation.** Before moving up, run L3 to checkpoint the holdout performance.
4. **Layer demotion is allowed.** If at Layer 3 you realize a Layer 1 change would help, you can drop back. But the change must stay within the demoted layer's scope.

## Priority Ladder (Within Any Layer)

Regardless of which layer you're operating in, follow this priority for choosing WHAT to change:

### Priority 1 — Fix Crashes
Cases that error out instead of producing output. These are the most valuable to fix because a crash yields 0 information.

### Priority 2 — Exploit Success Patterns
If mutation type X worked on case A, try the same pattern on case B. Example: if adding a disambiguation hint fixed case-12, look for other cases that have similar ambiguity.

### Priority 3 — Attack Persistent Failures
Cases that have failed for 3+ consecutive iterations. These are the "hard" cases. Review their traces carefully — the pattern of failure often reveals a systematic issue.

### Priority 4 — Explore New Directions
Try a mutation type that hasn't been attempted yet. This prevents getting stuck in a local optimum.

### Priority 5 — Simplify
Remove instructions that aren't contributing. Shorter skills are often better — less instruction means less confusion for the model. Check if removing a section maintains pass_rate.

### Priority 6 — Aggressive Mutation
Only after 5+ consecutive discards. Restructure a section, change the approach, try a fundamentally different strategy. High risk, but necessary when incremental changes aren't working.

## Evidence-Based Mutation Protocol

Every mutation proposal MUST include:

1. **Target case(s):** Which specific case(s) this mutation aims to fix
2. **Trace evidence:** Specific lines from the trace showing WHY the case failed
3. **Counterfactual:** "If I change X, the model should do Y instead of Z"
4. **Risk assessment:** Which currently-passing cases might be affected

This prevents "vibe-based" mutations — changes made because they "feel right" rather than because evidence supports them.

The trace is the diagnostic tool. Don't summarize it — read it. The difference between a correct and incorrect routing decision is often a single sentence in the skill instructions that the model misinterpreted.
