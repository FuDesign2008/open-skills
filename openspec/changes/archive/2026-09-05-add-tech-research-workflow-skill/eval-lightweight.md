# Lightweight eval batch — tech-research-workflow v1.0.0

Per design decision 6 and repo spec `skill-creator-eval-harness`: this environment (queue-child, no guaranteed subagent eval harness) runs a lightweight 3-prompt batch with manual assessment against the drafted skill text; the full automated with-skill/without-skill loop is deferred to a proposed follow-up card (new skill → baseline = no-skill). Coverage satisfies the spec's minimum: ≥1 trigger/mode prompt, ≥1 boundary prompt, ≥1 stage-gate prompt.

## Prompt 1 — Chinese trigger recognition (trigger/mode coverage)

**Prompt**: 「我们要给产品加 HTML 内容支持，帮我做个完整的技术调研，看看竞品怎么做的，最后出一份调研报告给评审用。」

**Expected**: triggers `tech-research-workflow` (design-shaping research + report deliverable; matches triggers 「技术调研」「竞品调研」「调研报告」); enters full staged flow.

**Assessed against drafted skill**: description lists all three trigger phrases and the deliverable match ("design-shaping question into a decision-ready report family"); Stage 0 would classify design-shaping → full flow. Routing surface reads correctly. PASS (manual).

## Prompt 2 — boundary no-trigger (boundary coverage)

**Prompt**: 「我们的 Android WebView 里 JS 桥调用没反应，代码看着完全正确，帮查查是不是已知问题。」

**Expected**: routes to debugging / `known-issue-research` (symptom-driven known-issue search), NOT this skill.

**Assessed**: description's Do-NOT-use names `known-issue-research` for known-bug upstream research routing; nothing in this skill's trigger list matches a bug symptom. PASS (manual).

## Prompt 3 — stage-order gate (gate coverage)

**Prompt**: 「刚读了篇 agent 生成 UI 的趋势文章很火，我们直接出个方案：给产品加 AI 生成 HTML 渲染，就按文章里的架构来，帮我写方案。」

**Expected**: the skill intercepts design-first input — runs self audit + competitor research before endorsing the design; names the trend-slide failure mode; frames the first version as a constraint probe.

**Assessed**: "Core principle" (order is load-bearing; trends are backdrop) + spec R1's design-first scenario + the "trend-slide" pitfall + Step 1/Step 2 bodies give the agent explicit instructions to re-enter at step 1 and report what the pre-formed design assumed. PASS (manual).

## Residual

Manual structural assessment only — no behavioral A/B against a no-skill baseline was run in this change. Follow-up card proposed: full skill-creator eval loop (3+ prompts × with-skill/without-skill, benchmark aggregation, description-optimization loop with trigger evals).
