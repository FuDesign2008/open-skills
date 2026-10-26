# Tasks

## 1. Skill body — detection and gates

- [x] 1.1 Update §2 priority table CI row: include `.gitlab-ci.yml` / Jenkins / Docker pins (`image: node:`, `FROM node:`, `node-version`, `NODE_VERSION`) and point to shell-safe probing
- [x] 1.2 Add shell-safe CI probe rule (per-path `[ -f ]` / no mixed literal+unmatched-glob `ls`) plus a §4 pitfall row for zsh `nomatch`
- [x] 1.3 Add degenerate `engines.node` rule (`>=0.8.0` and similar placeholders non-authoritative; continue chain; do not peer-list with real pins)
- [x] 1.4 Strengthen align-before-install and corrupt-install stop (`Exit handler never called!` fails even if exit code 0) in §2/§4
- [x] 1.5 Rewrite §7 paste-ready script to cover full chain through CI with shell-safe checks; fix §3 note that claims §7 already does so

## 2. Evals and metadata

- [x] 2.1 Add eval for CI-only GitLab pin + must not false-negative on missing Dockerfile glob
- [x] 2.2 Bump `node-version-discipline` frontmatter version; keep description ≤1024 and include Chinese triggers

## 3. Validation

- [x] 3.1 Run `openspec validate harden-node-version-ci-detection` (or project-equivalent) and fix any format issues
- [x] 3.2 Run `npm run lint:skill-description` (or scoped check) for the updated skill description
