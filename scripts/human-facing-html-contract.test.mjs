import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("..", import.meta.url);
const read = (rel) => fs.readFileSync(new URL(rel, root), "utf8");

test("goal-driven-queue defines human-facing HTML views", () => {
  const skill = read("skills/goal-driven-queue/SKILL.md");
  const reference = read("skills/goal-driven-queue/reference.md");

  assert.match(skill, /Every human-facing queue record has a generated HTML view/);
  assert.match(skill, /the Markdown file remains the canonical record/);
  assert.match(skill, /`config` and `approaches\/\*\.md` stay Markdown-only/);
  assert.match(skill, /never hand-writes human-facing HTML/);
  assert.match(skill, /single HTML generator/);
  assert.match(skill, /renderReviewPage/);
  assert.match(skill, /renderEvidencePage/);
  assert.match(skill, /`verification\.html` is the acceptance entry page/);
  assert.match(skill, /re-render immediately before any open/);
  assert.match(skill, /Trigger: interactive/);
  assert.match(skill, /An enqueue shell does not write a view\./);
  assert.match(skill, /Human-facing records and HTML chrome follow the human's conversation language/);
  assert.match(skill, /\[reference\.md\]\(reference\.md\) § Human-Facing HTML Views/);
  assert.doesNotMatch(skill, /following explain-clearly with the form fixed to HTML/);
  assert.doesNotMatch(skill, /writes the same HTML directly under the same escaping/);

  assert.match(reference, /## Human-Facing HTML Views/);
  assert.match(reference, /Every view carries a shared navigation block/);
  assert.match(reference, /Trigger: interactive \| scheduled/);
  assert.match(reference, /designed reading documents, not a line-by-line Markdown dump/);
  assert.ok(reference.includes("--kind card|triage|progress|verification|report"));
  assert.match(reference, /Tables with seven or more columns render as labeled record cards/);
  assert.match(reference, /horizontal scroll container with minimum column widths/);
  assert.match(reference, /renderReviewPage/);
  assert.match(reference, /renderEvidencePage/);
  assert.match(reference, /prefers-color-scheme/);
  assert.match(reference, /--file-root <workspace-root>/);
  assert.match(reference, /URLs in body text become links/);
  assert.match(reference, /A URL ends at whitespace or CJK punctuation/);
  assert.match(reference, /print the `\.md` paths instead of writing HTML by hand/);
  assert.match(reference, /Card HTML view:/);
  assert.match(reference, /- MR:/);
  assert.match(reference, /verification\.html/);
  assert.match(reference, /reports\/<card-slug>\.html/);
  assert.match(reference, /written in the language the human used in the conversation/);
});

test("goal-driven-queue defines queue-wide auto-MR", () => {
  const skill = read("skills/goal-driven-queue/SKILL.md");

  assert.match(skill, /`MR: opened <url>`/);
  assert.match(skill, /`MR: failed — <reason>`/);
  assert.match(skill, /`MR: skipped — no reviewable diff \(<status output>; <diff output>\)`/);
  assert.ok(
    skill.includes("git status --porcelain -- . ':(exclude).goal-driven' ':(exclude).explain-clearly'"),
  );
  assert.match(skill, /git diff --stat/);
  assert.match(skill, /short output summary/);
  assert.match(skill, /set to `failed`/);
  assert.match(skill, /Merge, release, protected-branch operations, and any auto-merge remain human-only\./);
  assert.match(skill, /does not edit a child engine's completion-report template/);
  assert.match(skill, /completion report, the progress document, the verification document, and the acceptance package/);
});

test("record step uses the renderer for review and evidence pages", () => {
  const skill = read("skills/goal-driven-queue/SKILL.md");
  const spec = read("openspec/specs/goal-queue/spec.md");

  assert.match(skill, /writes one review JSON/);
  assert.match(skill, /one evidence JSON/);
  assert.match(skill, /inspect it per `completion-evidence-discipline`/);
  assert.match(skill, /Put each item's pending status and inspection note on the evidence JSON/);
  assert.match(spec, /generate the review HTML with `renderReviewPage`/);
  assert.match(spec, /MUST NOT follow explain-clearly to produce it/);
  assert.match(spec, /generate the evidence HTML with `renderEvidencePage`/);
  assert.match(spec, /review body carries no standalone evidence link/);
  assert.doesNotMatch(spec, /following explain-clearly with the form fixed to HTML/);
});

test("agent-only records and enqueue shells stay out of the view contract", () => {
  const skill = read("skills/goal-driven-queue/SKILL.md");
  assert.match(skill, /`config` and `approaches\/\*\.md` stay Markdown-only/);

  for (const rel of [
    "skills/jira-fix-queue/SKILL.md",
    "skills/opsx-jira-fix-queue/SKILL.md",
  ]) {
    const shell = read(rel);
    assert.doesNotMatch(shell, /Human-Facing HTML Views/, rel);
    assert.doesNotMatch(shell, /MR: opened/, rel);
  }
});

test("live specs forbid hand-written HTML fallback and wire standalone nav", () => {
  const goalQueue = read("openspec/specs/goal-queue/spec.md");
  const goalRun = read("openspec/specs/goal-run/spec.md");
  const workflow = read("skills/goal-driven-workflow/SKILL.md");

  assert.doesNotMatch(goalQueue, /write the same HTML directly/);
  assert.doesNotMatch(goalQueue, /writes the same escaped, self-contained HTML/);
  assert.match(goalQueue, /print the `\.md` paths instead of writing HTML by hand/);
  assert.match(goalQueue, /that card's review HTML page, that card's evidence HTML page/);
  assert.match(goalQueue, /path of its review HTML page and the path of its evidence HTML page/);

  assert.match(goalRun, /same shared navigation block into both the review page and the evidence page/);
  assert.match(goalRun, /review ↔ evidence/);
  assert.match(goalRun, /evidence page MUST receive the same shared navigation block/);

  assert.match(workflow, /Pass the same shared navigation block into both pages/);
  assert.match(workflow, /cross-link review ↔ evidence/);
  assert.match(workflow, /skills\/goal-driven-queue\/scripts\/render-html\.mjs/);
  assert.match(workflow, /if that module is missing, stop and print/);
});
