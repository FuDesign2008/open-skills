import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("..", import.meta.url);
const read = (rel) => fs.readFileSync(new URL(rel, root), "utf8");

test("goal-driven-queue writes one review HTML per done card", () => {
  const skill = read("skills/goal-driven-queue/SKILL.md");
  assert.match(skill, /one HTML page/);
  assert.match(skill, /form fixed to HTML/);
  assert.match(skill, /manual, auto, or ai-proxy/);
  assert.match(skill, /problem, the cause, and the completed fix/);
  assert.match(skill, /not done does not get this page/);
  assert.match(skill, /verification\.md section records that HTML path/);
});

test("enqueue shells do not write the review HTML", () => {
  for (const rel of [
    "skills/jira-fix-queue/SKILL.md",
    "skills/opsx-jira-fix-queue/SKILL.md",
  ]) {
    const skill = read(rel);
    assert.doesNotMatch(skill, /form fixed to HTML/);
    assert.doesNotMatch(skill, /one HTML page/);
  }
});

test("standalone goal-driven-workflow writes one page and a queue child does not", () => {
  const skill = read("skills/goal-driven-workflow/SKILL.md");
  assert.match(skill, /standalone run, write one HTML page/);
  assert.match(skill, /form fixed to HTML/);
  assert.match(skill, /queue child, the completion report includes the problem, the cause, and the completed fix/);
  assert.match(skill, /does not write the HTML page/);
});

test("queue-child engines report three facts and do not write HTML", () => {
  for (const rel of [
    "skills/jira-fix-workflow/SKILL.md",
    "skills/opsx-jira-fix-workflow/SKILL.md",
    "skills/opsx-solve-workflow/SKILL.md",
    "skills/solve-workflow/SKILL.md",
  ]) {
    const skill = read(rel);
    assert.match(skill, /problem, the cause, and the completed fix/, rel);
    assert.match(skill, /does not write the HTML page/, rel);
  }
});
