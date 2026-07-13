---
name: node-version-discipline
version: "1.0.0"
user-invocable: true
description: "Node version discipline — before running tsc / eslint / build / test / install in any Node project, force-align the Node version to the project's declared version (.nvmrc / .node-version / .tool-versions / volta / engines.node) and disclose it in the verification report, preventing false-pass / false-fail when the host default Node mismatches the project-pinned version. Hard-depended on by typescript-check, jira-fix-workflow, opsx-jira-fix-workflow, opsx-solve-workflow; soft-referenced by ensure-tests and solve-workflow. 中文触发词「node 版本对齐」「版本对齐」「nvm 对齐」「.nvmrc」「Node 版本纪律」「对齐 Node 版本」, English aliases node version discipline, nvm use, align node version."
---

# Node Version Discipline (.nvmrc)

> Before running any build / lint / type-check / test / install command in a Node project, align the Node version to `.nvmrc` (fallback `engines.node`). Otherwise verification results are untrustworthy.

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

If the chain finds nothing, **do not silently fall back to the default Node** — that is exactly the false-pass/false-fail trap this skill prevents:

1. Use the current **Active LTS** as the fallback (check [nodejs.org/previous-releases](https://nodejs.org/en/about/previous-releases); as of 2026-07 that is Node 24).
2. State in the report: *"Project declares no Node version — used Active LTS (Node 24) as fallback. Recommend adding `.nvmrc` or `engines.node` to make it explicit."*
3. Pure file I/O / git / grep (no Node runtime) needs no alignment.

## 3. Standard Operating Procedure (SOP)

### Step 1 — Detect the constraint

```bash
# Prefer .nvmrc (walk up the tree)
cat .nvmrc 2>/dev/null
# Fallback to package.json engines
node -e "console.log(require('./package.json').engines?.node || 'no engines constraint')" 2>/dev/null
```

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
probe_file() {  # $1 = filename; prints a semver walking up the tree
  for d in . .. ../.. ../../..; do
    [ -f "$d/$1" ] && { cat "$d/$1" | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+' | head -1; return; }
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
  echo "ℹ️ No declaration found — use Active LTS (Node 24) as fallback and state it in the report. Current: $(node -v)"
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
- Hard-dependents: `typescript-check`, `jira-fix-workflow`, `opsx-jira-fix-workflow`, `opsx-solve-workflow`.
- Soft-referencers: `ensure-tests`, `solve-workflow`.
