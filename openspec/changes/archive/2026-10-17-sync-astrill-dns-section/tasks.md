## 1. OpenSpec artifacts

- [x] 1.1 Scaffold change (proposal / specs delta / design / tasks)

## 2. Skill

- [x] 2.1 Add the "DNS Residue Detection and Recovery" section to `skills/astrill-control/SKILL.md` after "State Machine and Probes" (probes and recovery commands verbatim; sudo handoff note; vary-by-setup note; generalized provenance; no project identifiers)
- [x] 2.2 Bump frontmatter version `1.0.0` → `1.1.0` (description untouched)

## 3. Indexes

- [x] 3.1 Regenerate `docs/generated/skills-index.md` (astrill-control version column → 1.1.0)

## 4. Gates

- [x] 4.1 `node scripts/lint-skill-description.mjs` → exit 0
- [x] 4.2 `node scripts/lint-skill-deidentification.mjs --base origin/main` → no new findings
- [x] 4.3 `node scripts/gen-skill-docs.mjs && git diff --exit-code docs/generated/skills-index.md` → clean
- [x] 4.4 `openspec validate astrill-control --type spec` and `openspec validate --specs` → pass
- [x] 4.5 Read-through fidelity vs the source section (commands verbatim; four content requirements present; no identifier leaks)

## 5. Delivery

- [x] 5.1 Commit on `feat/astrill-dns-section-sync` (`feat:` prefix); push with explicit refspec `git push -u origin feat/astrill-dns-section-sync`; no PR (merge stays human)
