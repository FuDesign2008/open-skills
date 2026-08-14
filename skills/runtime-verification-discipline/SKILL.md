---
name: runtime-verification-discipline
version: "1.0.0"
user-invocable: false
description: "Hard discipline for runtime verification in PDCA workflows: the AI executes verification itself in an environment — real preferred over simulated, subject to determinism + safety — never defaulting to a human checklist. Attempt-first, resolve a pluggable provider (project script/skill → shared capability skill), and hand to a human only at a true hard boundary with a stated reason. Use at any workflow verify/check stage (bug fix or feature) to decide WHERE verification runs, WHO runs it, WHETHER it suffices. Referenced by PDCA hosts via frontmatter dependencies. Triggers — 「环境验证」「真实环境验证」「模拟环境验证」「AI 验证」「验证分层」「验证充分性」 / runtime verification, environment verification, real vs simulated. Do NOT alias completion-evidence-discipline (evidence freshness) or runtime-evidence-debug (debug instrumentation)."
---

# Runtime Verification Discipline

> Internal shared skill. Single source of truth for **how verification gets executed** in PDCA workflows: the AI runs verification itself, in the right environment, and only hands to a human at a genuine hard boundary. Hosts declare it in `dependencies` and abort if missing — no silent fallback.
>
> This is the **rule layer**. It decides *where* verification runs, *who* runs it, and *whether it is sufficient*. It does **not** contain environment-driving recipes (channel selection, CDP calls) — those live in capability skills such as `browser-debug-toolkit`. Concrete examples and per-host integration snippets are in [reference.md](reference.md).

## Why this skill exists

Workflows used to treat verification as "AI runs Bash test commands; everything else is handed to the user as a checklist." That posture wastes the AI's ability to drive real and simulated environments, and it turns "hand to the user" into an unexamined default — sometimes used because the AI did not try, not because it genuinely could not. The result is avoidable manual verification labor and, worse, occasional false confidence when a low-fidelity check is reported as if it were conclusive.

The meta-lesson this skill enforces:

> **Verification is the AI's job, done in an environment. Prefer the highest-fidelity environment the AI can drive safely and deterministically; hand to a human only at a true hard boundary, and say exactly why.**

## When this applies

At any workflow's verify/check stage, for any change with observable behavior — bug fix or feature development alike. If nothing about the change can be exercised in any environment, this skill does not apply (a pure docs/comment change may need no runtime verification).

## Iron law

**VERIFICATION IS EXECUTED BY THE AI IN AN ENVIRONMENT, NOT DELEGATED TO THE HUMAN AS A CHECKLIST.**

Attempt execution first — that is the default, not an option. Only a classified true hard boundary justifies handing a step to a human, and the reason must be stated.

## Environment tier model

Classify an environment by how faithfully it matches the app's **production runtime target**. "Real" vs "simulated" is relative to that target, not absolute:

| Production target | Real environment | Simulated environment |
|-------------------|------------------|------------------------|
| Web app | A real browser (CDP-driven, e.g. ego-browser / chrome-devtools-mcp) | Headless DOM / jsdom-style fake DOM |
| Electron app | The Electron application itself | A plain browser |
| Mobile app | A physical device | An emulator / simulator / browser |

A bug that is platform-specific can only be conclusively verified at the tier where that platform's runtime actually executes.

## Tier selection rule

Choose the **highest-fidelity tier that the AI can drive with zero human intervention AND that is sufficiently deterministic and safe for the assertion being made**. Fidelity is traded against confidence-per-cost, not maximized blindly:

- **Determinism** — a real environment carries real network and timing, so it is flakier. When you need a stable, re-runnable signal, verify in simulation first.
- **Safety / side effects** — a real environment can mutate real backends, real user data, or send real pushes. For a verification that writes, simulate first (sandbox) and confirm in the real environment after.
- **Fidelity by bug class** — a platform-specific bug needs the tier where that platform runs; a platform-agnostic logic bug does not.

So: **read-only, highly deterministic check → real environment directly. Write-involving or flaky-prone check → simulate first for a stable signal, then confirm in the real environment, and label both.**

## Provider resolution (pluggable)

Resolve *how* to verify in this project's environment by lookup, in order — convention over configuration:

1. **The project's own verification script or skill** — preferred. Projects SHOULD expose verification through a discoverable convention (e.g. a known-location verify script or a project skill) so the AI can find it without being told.
2. **A shared capability skill** from this library (e.g. `browser-debug-toolkit` for web, `android-webview-debug` for Android WebView) — the fallback.
3. **Neither exists** — proceed to the handoff classification below.

## Attempt-first, then classify the blocker (A/B/C)

When the AI cannot execute a verification, classify why before doing anything else:

- **A — unwired automation.** The check is automatable but no script exists yet. Wire it (write the script) or offer to wire it. Do **not** hand it off.
- **B — missing one-time setup.** The check is automatable but a toolchain/environment is not installed. Give the exact install/setup command and let the user decide; once set up, the AI takes over.
- **C — true hard boundary.** Hand to the human, and state the reason. C has three kinds: the AI **cannot act** (physical device, captcha, biometrics), the AI **cannot judge the result** (subjective UX, exploratory assessment), or the action has **real-world side effects**.

Never use a vague "no Bash / environment limits" hand-wave to hand off without classifying. The classification is what keeps "minimize human labor" honest — it forces the distinction between "I didn't wire it" and "it genuinely cannot be automated."

## Sufficiency check

Verification is sufficient only if it exercises the change's **exact behavior the way the software is really used**. The bar is not "the app boots" but "the fixed bug's specific symptom is gone on the real usage path" or "the new feature's real usage path works." If the assertion does not cover the changed behavior, the verification is insufficient regardless of which environment ran it.

## Honest tier labeling (non-blocking)

The verification report MUST state which tier each check actually used. When the tier used is below the production target, label it: "verified in simulation; real-environment smoke test recommended." This is a labeling duty, not a gate — it never blocks the AI from verifying at the reachable tier, but it forbids presenting a simulated result as real-environment confirmation.

## Boundaries

- **`completion-evidence-discipline`** — orthogonal axis. It governs evidence *freshness* (did you actually run it this turn); this skill governs *environment and executor* (which tier, who ran it, sufficient?). A pass claim must satisfy both.
- **`runtime-evidence-debug`** — that skill is debug *forensics*: instrument to find a root cause. This skill is verification *execution*: confirm a fix or feature works in an environment. Different purpose, despite the similar name.
- **Capability skills** (`browser-debug-toolkit`, `android-webview-debug`, future Electron/mobile skills) — they own channel selection and driving recipes. This skill only decides where/who/sufficiency and delegates the *how* to them.

## Integration guide (for hosts)

- Declare `runtime-verification-discipline` in frontmatter `dependencies`; abort at startup if missing.
- At the verify stage, add one thin line: "Verification execution follows `runtime-verification-discipline`" plus the host's own scope conditions. Keep the host's own orchestration and exits.
- Do **not** restate the tier model, selection rule, provider resolution, or A/B/C prose in the host — this skill is the single source.

Per-host edit shapes and worked examples are in [reference.md](reference.md).
