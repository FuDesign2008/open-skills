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
  assert.match(skill, /`verification\.html` is the acceptance entry page/);
  assert.match(skill, /re-renders immediately before any open/);
  assert.match(skill, /links to `progress\.html`, the triage HTML view, each card's HTML view, each executed card's packaged engine report's HTML view/);
  assert.match(skill, /A target that does not exist is annotated as unavailable/);
  assert.match(skill, /`reports\/<card-slug>\.md`/);
  assert.match(skill, /`reports\/<card-slug>\.html`/);
  assert.match(skill, /original path named in the footer/);
  assert.match(skill, /When Node is unavailable, the dispatcher writes the same HTML directly/);
  assert.match(skill, /prints the `\.md` paths instead of writing unsafe HTML/);
  assert.match(skill, /Trigger: interactive \| scheduled/);
  assert.match(skill, /auto-opens `verification\.html` at the Stage 3 handback only when/);
  assert.match(skill, /An explicit view request opens the requested page regardless of the recorded trigger/);
  assert.match(skill, /An enqueue shell does not write a view\./);

  assert.match(reference, /## Human-Facing HTML Views/);
  assert.match(reference, /Trigger: interactive \| scheduled/);
  assert.match(reference, /Card HTML view:/);
  assert.match(reference, /- MR:/);
  assert.match(reference, /verification\.html/);
  assert.match(reference, /reports\/<card-slug>\.html/);
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
