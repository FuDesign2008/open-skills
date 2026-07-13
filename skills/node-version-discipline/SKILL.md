---
name: node-version-discipline
version: "1.1.0"
user-invocable: true
description: "Node version discipline — before running tsc / eslint / build / test / install in any Node project, align the Node version to the project's declared version (.nvmrc / .node-version / .tool-versions / volta / engines.node) and disclose it in the verification report, preventing false-pass / false-fail when the host default Node mismatches the project-pinned version; when the project declares no Node version at all, ask the user for the version and offer to persist a declaration file (.nvmrc etc.) so future sessions/CI/collaborators auto-align. Use this skill whenever the user is about to run a version-sensitive Node command, or mentions Node version mismatch / wrong Node / version conflict / 切换 node 版本. 中文触发词「node 版本对齐」「版本对齐」「nvm 对齐」「.nvmrc」「Node 版本纪律」「对齐 Node 版本」「切换 node 版本」「切到指定 node 版本」「node 版本不对」「node 版本不一致」「版本不匹配」「初始化 node 版本管理」「为工程增加 node 版本声明」「给工程加 .nvmrc」「没有 .nvmrc 怎么办」「无 .nvmrc 时补一个」「工程没有 node 版本管理」, English aliases node version discipline, nvm use, align node version, switch node version, add nvmrc, initialize node version."
---

# Node Version Discipline

> Before running any build / lint / type-check / test / install command in a Node project, align the Node version to the project's declared version (probe the full chain: `.nvmrc` → `.node-version` → `.tool-versions` → `volta.node` → `engines.node` → CI config). Otherwise verification results are untrustworthy.

## 1. Why alignment is mandatory

The host's default Node version (e.g. v22) frequently mismatches the project's `.nvmrc`-pinned version (e.g. v14). Running `tsc` / `eslint` / `npm run build` / `npm test` on the default version produces:

| Risk | Effect |
|------|--------|
| False pass | Higher Node is more permissive — tsc/eslint pass, but the pinned version actually crashes at runtime |
| False fail | Higher Node breaks legacy toolchains (e.g. Webpack 4 native deps), surfacing build errors unrelated to the code and misdirecting the investigation |
| Behavioral drift | Older versions lack APIs (`structuredClone`, `AbortController`...) — runtime behavior diverges |
| Dependency resolution skew | `node_modules` installs native modules for whichever Node is active; mismatch installs the wrong variant |

> Core lesson: even if a higher version happens to pass and results coincidentally match, the `.nvmrc`-pinned version is the source of truth. "It passed on a higher version" never justifies skipping alignment.

## 2. Decision rules

### When to align

If the project declares a Node version **by any means** (see the priority chain below), align **before** running:

- `tsc` / `npx tsc` / `npm run type-check`
- `eslint` / `npm run lint`
- `npm run build` / `webpack` / any build script
- `npm test` / `jest` / any test command
- `npm install` / `npm ci` (installing deps on the wrong version pulls wrong native modules)
- any `npm run <script>` (scripts may invoke version-sensitive tools internally)

### Version-declaration priority chain

`.nvmrc` is the nvm convention, not the only one. Node version managers disagree on which file they read, so probe the whole chain in order — first hit wins:

| # | Source | Kind | Cross-tool notes |
|---|--------|------|------------------|
| 1 | `.nvmrc` | exact | nvm + fnm native; asdf needs `legacy_version_file`; Volta ignores |
| 2 | `.node-version` | exact | fnm / nodenv / nvs native; asdf needs legacy flag; **nvm ignores** |
| 3 | `.tool-versions` | exact | asdf native |
| 4 | `package.json` → `"volta".node` | exact | Volta native — the only source Volta reads |
| 5 | `package.json` → `engines.node` | range | declarative only (npm warns, doesn't enforce unless `engine-strict`); pick an installed version inside the range |
| 6 | CI config `node-version` (e.g. `.github/workflows/*.yml`) | exact | inference — label it as such in the report |

Walk up the directory tree for files (rows 1-3); read `package.json` and CI config from the project root. The two cross-tool blind spots in rows 1 and 2 are non-obvious — see §4.

### When no declaration exists

If the chain finds nothing, **do not silently fall back to the default Node or pick a version on the user's behalf** — that is exactly the false-pass/false-fail trap this skill prevents, and guessing a version risks running the whole verification on the wrong Node. Turn the user's answer into a persistent project asset so this round-trip never has to repeat:

1. **Stop and ask the user** which Node version to use. Prompt with: *"This project declares no Node version (no `.nvmrc` / `.node-version` / `.tool-versions` / `volta` / `engines.node` / CI pin found). Which Node version should I align to before running [tsc / build / test / ...]?"* Wait for the user's answer; do not proceed with a guessed version.
2. **Probe the toolchain** with the read-only `detect_manager` snippet (§2.2) to recommend *which* declaration file fits this project/env. The snippet prints signals only — it does not write anything.
3. **Confirm with the user before persisting.** Offer to write the recommended declaration file containing the exact version the user just gave (§2.1 picks the file type; the version is the user's, in full `X.Y.Z` form — e.g. `22.5.0`, not a bare major). Persist only after the user agrees; if they decline, skip writing and continue with alignment-only for this session. Either way, align to the stated version (SOP §3) before running the real command.
4. Pure file I/O / git / grep (no Node runtime) needs no alignment and no declaration file.

> Why ask rather than default to Active LTS: the "correct" Node for a project depends on context the AI doesn't have — production runtime, CI matrix, teammate environments, legacy constraints. A wrong guess silently invalidates every downstream result. Asking is one cheap round-trip; a false pass/fail can misdirect an entire investigation.
>
> Why persist the answer (not just align once): the user's version choice is high-value engineering information. If it lives only in the conversation, every future session, CI run, and collaborator hits the same "no declaration" wall and may converge on a *different* version. Writing one small declaration file closes the loop — the next session reads it on the first probe and never asks again.

### 2.1 Which declaration file to write

Pick the file type from the signals `detect_manager` (§2.2) reported. First matching row wins; `.nvmrc` is the catch-all default because nvm/fnm (and asdf with `legacy_version_file`) all read it, giving the broadest cross-tool coverage.

| Signal (from §2.2) | File to write | Content shape | Why this file |
|---|---|---|---|
| `package.json` already has a `volta` block, **or** `volta` is installed on the host | `package.json` → `volta.node` field | `"volta": { "node": "22.5.0" }` (merge into existing `volta` object) | Volta reads only this source; a `.nvmrc` would be invisible to Volta users |
| `asdf` installed on host, **or** project already has a `.tool-versions` for other languages | `.tool-versions` (append a line) | `nodejs 22.5.0` | asdf's native source; keeps all language pins in one file |
| `fnm` **or** `nodenv` installed (and neither of the above) | `.node-version` | `22.5.0` | fnm/nodenv native source; nvm ignores this file, so don't pick it when nvm is the only manager |
| None of the above / unsure | `.nvmrc` | `22.5.0` | Broadest coverage: nvm + fnm native, asdf with `legacy_version_file`; the safe default |

**Version format — write the exact patch.** Use the full `X.Y.Z` the user specified (or the exact installed version if the user said "use what's installed" — capture it via `node -v` and strip the leading `v`). Do **not** write a bare major (`22`) or a range (`>=20`): a declaration file's job is to pin one reproducible version so every environment converges identically. `.nvmrc`/`.node-version` take the bare `22.5.0` (no `v` prefix, nvm convention); `.tool-versions` takes `nodejs 22.5.0`; `engines.node`/`volta.node` take the quoted string `"22.5.0"`. (If the user later wants a range for `engines.node`, that's a separate conscious choice — the persist step here pins exact.)

**Persist-then-install order.** Write the declaration file first, then handle installation. The file is a statement of intent for CI and collaborators — it does not depend on the local machine having that version. After writing, if `ls ~/.nvm/versions/node/` shows the version is missing locally, prompt `nvm install <version>` (or the manager equivalent) per SOP §3 Step 2, then proceed. This way the project asset exists even if the user defers installation.

**Where to write.** Project root (same level as `package.json`). For `.nvmrc`/`.node-version`/`.tool-versions` create a new file; for `volta.node`/`engines.node` merge into the existing `package.json` — never overwrite the file, always edit the JSON in place.

### 2.2 detect_manager — read-only toolchain probe

Paste-ready, **read-only**. It prints signals so the AI can pick the right file per §2.1; it must not write any file. Writing is a separate, user-confirmed step (§2 step 3).

```bash
# Read-only: detect which Node version manager this project/env uses.
# Prints one signal per line. AI maps them to a declaration file via §2.1.
# Does NOT write anything — persistence is a separate, user-confirmed step.
[ -f package.json ] && node -e "require('./package.json').volta && console.log('volta-struct')" 2>/dev/null
command -v volta  >/dev/null && echo "volta-installed"
command -v asdf   >/dev/null && echo "asdf-installed"
[ -f .tool-versions ] && echo "tool-versions-exists"
command -v fnm    >/dev/null && echo "fnm-installed"
command -v nodenv >/dev/null && echo "nodenv-installed"
# No output above → default to .nvmrc (broadest cross-tool coverage).
```

> The probe detects the *manager*, not the version. The version always comes from the user (§2 step 1) — never from the host default.

## 3. Standard Operating Procedure (SOP)

### Step 1 — Detect the constraint

```bash
# Prefer .nvmrc (walk up the tree)
cat .nvmrc 2>/dev/null
# Fallback to package.json engines
node -e "console.log(require('./package.json').engines?.node || 'no engines constraint')" 2>/dev/null
```

> The snippet above shows the two most common sources for clarity. The full cross-tool priority chain (`.nvmrc` → `.node-version` → `.tool-versions` → `volta.node` → `engines.node` → CI config) is implemented as a paste-ready script in §7 — use that in practice.

### Step 2 — Confirm the target version is installed

```bash
ls ~/.nvm/versions/node/ | grep <target-version>
```

Not installed → prompt the user to `nvm install <version>` and **stop**.

### Step 3 — Switch and run in a single command (recommended)

```bash
source ~/.nvm/nvm.sh && nvm use <target-version> >/dev/null 2>&1 && node -v && <actual-command>
```

> Shell state is not persistent. `nvm use` only affects the current shell process. Each Bash tool call may spawn an independent shell, so `nvm use` does **not** carry across calls. Every version-sensitive command must do `source ~/.nvm/nvm.sh && nvm use <version> && <command>` **inside the same call** — never split into "nvm use first, then run".

### Step 4 — Confirm the switch succeeded

After switching, always `node -v` before the real command. `nvm use` can fail silently (e.g. target not installed); skipping confirmation risks assuming a switch that never happened.

## 4. Common error patterns (callers must intercept)

| Pattern | Consequence | Correct approach |
|---------|-------------|------------------|
| `npx tsc --noEmit` directly, ignoring `.nvmrc` | Untrustworthy result | Detect `.nvmrc` first, `nvm use`, then run |
| Two steps: `nvm use 14` then `tsc` in the next call | Shell state lost, reverts to default | Single call: `source && nvm use && cmd` |
| `nvm use 14` without `node -v` | Silent failure mistaken for success | Always `node -v` after switching |
| `nvm use` on an uninstalled version | Errors or silent failure | `ls ~/.nvm/versions/node/` first; prompt `nvm install` if missing |
| `nvm use node` / `nvm use default` | May not hit the `.nvmrc` version | Use the exact version, or `nvm use $(cat .nvmrc)` |
| "Higher version passed" ≡ "pinned version passes" | False pass | Pinned version is the source of truth |
| Project has `.node-version` but you're on nvm | nvm ignores `.node-version` → silent fall-back to default | Probe the full chain (§2); if only `.node-version` exists, `nvm use $(cat .node-version)` |
| Project pins via Volta (`package.json` `"volta"`) but you're on nvm/fnm | Volta's pin is invisible to nvm/fnm | Read `package.json` `"volta".node` and `nvm use` that exact version |

## 5. Verification report disclosure

When reporting verification results, disclose the Node version — not just pass/fail:

```
## Code quality
- Node version (.nvmrc v14.21.3): ✅ switched via nvm use
- tsc --noEmit: ✅ 0 errors
- eslint: ✅ no errors/warnings
```

When the project declared no version and the user supplied one, disclose that fact explicitly so the source is auditable. Distinguish whether the declaration was persisted (so the next session auto-aligns) or only applied this once:

```
- Node version (user-specified v20.11.0, no prior project declaration): ✅ aligned; persisted to .nvmrc (22.5.0) — future sessions will auto-align
```

If the user declined to persist, make that explicit so the gap is visible:

```
- Node version (user-specified v20.11.0, no project declaration): ✅ aligned for this run; user declined to persist — declaration still missing, recommend adding .nvmrc
```

If a command ran without switching, mark ⚠️ and re-run.

## 6. Two integration contracts

This skill is the **dependee**, offering two ways to be referenced.

### 6.1 Hard-dependency contract (core skills)

For zero-tolerance scenarios where alignment is a hard precondition (tsc / eslint / build):

```yaml
# in the caller's frontmatter
dependencies:
  - node-version-discipline
```

The caller runs a precondition check at startup (same pattern as `solve-workflow`): if this skill is absent, abort immediately and prompt to install. **No silent degradation** — guarantees trustworthy verification in any environment.

### 6.2 Soft-reference contract (extension skills)

For scenarios where alignment is best practice (npm test / browser debug / general engineering commands), add one line at the relevant step in the caller body:

> Before running, invoke the `node-version-discipline` skill to align Node to `.nvmrc`.

No `dependencies` declared, no precondition check — relies on the AI invoking it consciously at that step.

## 7. Self-contained detection script (paste-ready)

```bash
# Probe the full version-declaration chain (cross-tool), then switch via nvm.
# First hit in priority order wins. See §2 for why we probe beyond .nvmrc.
probe_file() {  # $1 = filename; prints a version walking up the tree
  for d in . .. ../.. ../../..; do
    [ -f "$d/$1" ] && { cat "$d/$1" | grep -Eo 'v?[0-9]+(\.[0-9]+){0,2}' | head -1 | sed 's/^v//'; return; }
  done
}
NODE_VER="$(probe_file .nvmrc)"
[ -z "$NODE_VER" ] && NODE_VER="$(probe_file .node-version)"
[ -z "$NODE_VER" ] && NODE_VER="$(probe_file .tool-versions)"
# package.json: volta.node (exact) preferred over engines.node (range — handled manually)
if [ -z "$NODE_VER" ] && [ -f package.json ]; then
  NODE_VER="$(node -e "const p=require('./package.json'); console.log(p.volta?.node || '')" 2>/dev/null)"
fi
if [ -n "$NODE_VER" ]; then
  source ~/.nvm/nvm.sh 2>/dev/null && nvm use "$NODE_VER" >/dev/null 2>&1
  echo "✅ Node: $(node -v) (aligned to $NODE_VER)"
else
  echo "ℹ️ No declaration found — STOP and ask the user which Node version to use (do not guess). Current host default: $(node -v)"
  echo "   Then run detect_manager (§2.2) to pick a declaration file, confirm with the user, and persist it (§2.1) so future sessions auto-align."
fi
```

## 8. Fallback for non-nvm environments

The SOP assumes nvm (Unix / macOS). Other environments:

| Environment | Fallback action |
|-------------|-----------------|
| Windows | Prompt the user to switch manually (`nvm-windows` / `volta use`); mark ⚠️ "not auto-aligned, confirm version manually" in the report |
| fnm / volta / asdf | Replace `nvm use` with the equivalent (`fnm use` / `volta pin` / `asdf local nodejs <version>`) |
| Container / CI | Node version is fixed by the image; confirm the image version matches `.nvmrc` |

> Never pretend alignment happened — always state explicitly when auto-alignment was not performed.

## 9. Related

- Origin: a real-world fix where a mobile project pinned `.nvmrc` = v14.21.3 while the host defaulted to v22, producing tsc/eslint false-passes under the higher version.
- No-declaration path: when a project declares no Node version at all, §2 turns the user's answer into a persistent declaration file (§2.1 picks the type via §2.2's toolchain probe), closing the loop so the next session reads it on the first probe instead of asking again.
- Hard-dependents: `typescript-check`, `jira-fix-workflow`, `opsx-jira-fix-workflow`, `opsx-solve-workflow`.
- Soft-referencers: `ensure-tests`, `solve-workflow`.
