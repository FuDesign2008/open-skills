# Tasks

## 1. Time-ordered lead

- [x] 1.1 Add failing assertions to `scripts/explain-clearly-contract.test.mjs` for the classification order, the HTML player (one step at a time, opens on the first step, previous and next, no autoplay, one inline script only for that player), numbered steps on Markdown, plain text, and the current session, the four rational sections after the lead, the position-mark sentence, and the 「容易看懂」 trigger. Run that contract test and verify the new assertions fail before the skill text changes.
- [x] 1.2 Update `skills/explain-clearly/SKILL.md` and the comment in `skills/explain-clearly/assets/explanation-shell.html` so those assertions pass, the shell still has no script, and the description stays one double-quoted line within 1024 characters. Re-run the contract test and verify it passes.

## 2. Integration

- [x] 2.1 Run the project test suite and `openspec validate explain-clearly-lead-with-steps --type change --strict` on the Node version declared by this repo. Verify both pass.

## 3. Drop the four-section outline

- [x] 3.1 Change the contract test so it requires the shape-first explanation and rejects a mandatory four-section outline. Run it and verify the new assertions fail before the skill text changes.
- [x] 3.2 Update the skill, the shell comment, the delta spec, the proposal, and the design so the shape is the explanation and four prose sections are not required. Re-run the contract test, the project suite, and strict validation.

## 4. Review fixes

- [x] 4.1 Align the evidence requirement, the table-versus-diagram split, the current-session first match, the shell page, the worked examples, and the description with the shape-first explanation. Re-run the contract test, the project suite, and strict validation.

## Workflow follow-up

- Archive only after the user confirms. Auto mode stops before that confirmation.
