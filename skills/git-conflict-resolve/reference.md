# git-conflict-resolve Reference

> Referenced by SKILL.md's Y.1.5 ("Build-Artifact Short-Circuit"). The full details of the identification checklist and short-circuit rules live here; SKILL.md keeps only the process skeleton.

## Build Artifact Identification Checklist

A build artifact = a compiled/bundled derived file (machine-generated, carries no source intent, huge content). For each file in the cumulative list, Y.1.5 classifies it against the rules below — **matching any one of them** is enough to classify it as a build artifact.

### 1. Build-output directory prefixes

The file path is under one of these directory prefixes:

- `dist/`, `build/`, `out/`, `output/`
- `assets/`, `static/` (when used for build output)
- Bundled-resource directories: `resources/<bundle>/` (e.g. a desktop/mobile app's packaged-resource directory)
- Other common artifact roots seen across projects: `release/`, `artifacts/`, `.next/`, `.nuxt/`, `target/` (depending on the project)

### 2. File signatures

- **Hash chunk**: filename matches `<name>.<8+ hex digits>.js|css|mjs|map` (webpack/vite/rollup content-hash artifacts)
  - Regex: `[0-9a-f]{8,}\.(js|css|mjs|map)$`
- **Minified files**: `.min.js`, `.min.css`
- **Source maps**: `*.map`
- **Binary assets**: `.wasm`, fonts (`.woff2?`, `.ttf`, `.eot`), images (`.png`, `.jpg`, `.webp`)

### 3. Project-specific directory additions

Users may declare project-specific build-artifact directories or file signatures to append to the checklist above. Once declared, files under those paths/signatures are likewise classified as build artifacts.

### Default to caution (important)

Files with ambiguous boundaries (neither under a known build directory prefix nor matching a clear artifact signature) **must never be short-circuited** — route them through Y.2's semantic analysis instead.

Rationale: misclassifying source code as a build artifact and short-circuiting it → takes the release side directly and loses main-side changes, and that cost far outweighs reading one extra file. **When in doubt, read it rather than misjudge it.**

---

## Build-Artifact Short-Circuit Resolution Rules (Y.1.5 details)

Build artifacts are machine-generated derivatives whose authority is always the release branch. Once the short-circuit matches, **do not read the three-way content and do not perform semantic analysis** — resolve directly by taking the release side, based on the conflict type.

### Content conflict (UU) / Add-Add

```bash
# Take the release side (theirs)
git checkout --theirs <FILE> && git add <FILE>
```

### Whole-directory build artifact

```bash
git rm -rfq <DIR>
git checkout origin/<SOURCE> -- <DIR>
git add <DIR>
```

### Rename + build-artifact hash (never reads file content)

When the conflict is a rename + hash (the diff3 labels reference different hash filenames), use **git's rename metadata** to get both sides' filenames — never read the file content:

```bash
# Rename info from the git index (diff3 carries old -> new)
git diff --name-status --diff-filter=U
# Output looks like: R100  old-abc123.js  new-def456.js

# Or (git 2.49+): git status --renamed-files
```

Once you have `OLD_FILE` / `NEW_FILE`:

```bash
git rm -f "$OLD_FILE" 2>/dev/null            # delete the old hash file, avoiding a leftover duplicate chunk
git checkout origin/<SOURCE> -- "$NEW_FILE"  # take the new hash file from release
git add "$NEW_FILE"
```

**Fallback (when rename metadata is missing)**: fall back to extracting the filename by "reading only the conflict-marker lines" — grep the first few lines from `git show :2:<FILE>` for the `^<<<<<<<` / `>>>>>>>` markers to get the filename, **without reading the full file**. This is a degraded path, used only when rename metadata isn't available.

### Post-resolution verification

Files resolved via the short-circuit **still go through the Y.4.5 instant verification** (a scan for residual conflict markers), to confirm no markers remain after taking the release side.

---

## Why Build Artifacts Aren't Read

1. **Token cost**: a single line of a minified/bundled file can run to hundreds of thousands of characters, so `git show :1:/:2:/:3:` can burn through a large number of tokens instantly.
2. **Semantic analysis is meaningless**: compressed code has no "intent from either side" to weigh, so Y.2's intent analysis doesn't apply to it.
3. **Extremely error-prone**: merging bundled files easily leaves residual conflict markers or keeps a stale version (real-world case: conflict markers were left inside a minified bundle chunk, and an old hash version was mistakenly kept, requiring a separate follow-up MR to fix it).
4. **Authority is unambiguous**: a build artifact's authority is always the release branch, with no ambiguity — simply overwrite it.
