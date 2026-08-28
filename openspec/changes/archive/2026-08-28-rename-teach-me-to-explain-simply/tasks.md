# Tasks: rename teach-me to explain-simply

## 1. Skill rename (hard cut)

- [x] 1.1 `git mv skills/teach-me skills/explain-simply` (preserve history)
- [x] 1.2 SKILL.md frontmatter: `name: teach-me` → `name: explain-simply`; re-lead description to Feynman framing (deep-in, simple-out), keep all Chinese triggers + Do-NOT-use boundaries + ≤1024 chars
- [x] 1.3 SKILL.md body: title → `# Explain Simply — Dual-Track Concept Explanation`; replace remaining `teach-me` self-references
- [x] 1.4 SKILL.md body: add `## Design root` section after the intro blockquote
- [x] 1.5 reference.md: update `teach-me` id references only (no example rewrite)

## 2. In-repo references

- [x] 2.1 AGENTS.md: skill-table row `teach-me` → `explain-simply` (boundary note updated: names now self-distinguish)
- [x] 2.2 docs/concept-explanation-dual-track.md: update id references
- [x] 2.3 docs/README.md: update id references

## 3. Index & validation

- [x] 3.1 Align Node version per node-version-discipline, run `node scripts/gen-skill-docs.mjs`, confirm `docs/generated/skills-index.md` reflects explain-simply
- [x] 3.2 Run `npm run lint:skill-description` — must pass (≤1024 chars)
- [x] 3.3 Zero-residue check: `grep -rn "teach-me" skills/ commands/ AGENTS.md docs/ openspec/specs/` returns no hits (archive exempt)
- [x] 3.4 `openspec validate rename-teach-me-to-explain-simply` passes

## 4. Archive & sync (stage 8)

- [x] 4.1 Archive change (sync deltas): main `openspec/specs/explain-simply/spec.md` created with Purpose + 5 requirements; post-sync, remove residual/empty `openspec/specs/teach-me/` if present
- [x] 4.2 Review final `git status` diff: main-specs update + archive move + no stray files
