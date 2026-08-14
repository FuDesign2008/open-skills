# runtime-verification-discipline — Reference

The main [SKILL.md](SKILL.md) is the lean contract. Read this when you need concrete examples: how to classify environments, how provider resolution plays out, and how each PDCA host wires the thin reference.

## Environment tier — worked examples

The tier is always judged against the app's production runtime target, not against what is convenient.

**Web app (production = browser):**
- Verifying a CSS fix by reading `getComputedStyle` in a CDP-driven real Chrome → **real environment** (highest tier, read-only, deterministic → verify directly).
- Verifying the same fix by asserting on a jsdom render → **simulated** (jsdom does not do real layout; fine for DOM-presence logic, not for computed-style/layout claims).

**Electron app (production = the desktop app):**
- Attaching CDP to the running Electron app and inspecting the renderer → **real environment**.
- Opening the same renderer bundle in a plain browser tab → **simulated** (no Node integration, no IPC to main, no native window behavior).

**Mobile app (production = physical device):**
- Driving the WebView on a USB-connected Android device via CDP → **real environment** for the WebView layer.
- Running the same WebView content in a desktop emulator or browser → **simulated**.
- Native-layer behavior (biometrics, real push, installer) on the physical device → real, but the AI usually **cannot act/judge** there → C-class handoff.

## Tier selection — applying the qualifiers

| Check type | Determinism | Safety | Recommended path |
|------------|-------------|--------|------------------|
| Read rendered output / computed style / network | High | Safe (read-only) | Real environment directly |
| Logic assertion, platform-agnostic | High | Safe | Simulation is fine and sufficient |
| Verification that writes to a backend | — | Risky in real | Simulate first → real confirm → label both |
| Check sensitive to real timing/network | Low in real | — | Simulate first for a stable signal, real-confirm once |
| Platform-specific bug (iOS-only, Electron-only) | — | — | Must reach the tier where that platform runs; below-target tier = label the residual |

## Provider resolution — worked examples

Lookup order: project provider → shared capability skill → honest handoff.

1. **Project provider present.** The project root exposes a discoverable verify entry (e.g. a `verify` script the project documents, or a project-level skill). Use it first — it knows the project's real environment.
2. **No project provider.** Fall back to the shared capability skill for the target platform: `browser-debug-toolkit` for anything browser-reproducible; `android-webview-debug` to enable Android WebView inspection, then drive it via CDP.
3. **Neither.** Classify the blocker (A/B/C) per SKILL.md. Only a C boundary hands to a human.

> Projects that want AI-driven verification SHOULD expose it via a stable, discoverable convention (a documented verify script or a project skill) so the AI can find it without being told — the same convention-over-configuration pattern mainstream tools use for config discovery.

## Per-host integration snippets

Each host adds `runtime-verification-discipline` to frontmatter `dependencies` and keeps only a thin reference at its verify stage. The edit shape differs by the host's current wording:

**solve-workflow** (Stage 7 "Running tests") — replace the "AI cannot execute → tell the user to run it yourself" binary with a thin reference:
> Verification execution follows `runtime-verification-discipline` (AI executes in an environment; hand to the user only at a classified true hard boundary). Report honesty per `completion-evidence-discipline`.

**opsx-solve-workflow** (Stage 7 "Test execution") — same replacement of the binary.

**jira-fix-workflow** (Stage 8 "Check & Verify") — add the reference alongside the existing `completion-evidence-discipline` / `staged-review-flow` honesty pointers.

**opsx-jira-fix-workflow** (verify stage) — align the "manual-verification items" wording: verification defaults to AI-in-environment; a step is listed as a manual-verification item only at a classified true hard boundary, with the reason recorded.

In every case: do **not** copy the tier model / selection rule / A/B-C prose into the host. One line, plus the host's own scope conditions.
