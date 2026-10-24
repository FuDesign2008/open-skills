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
  assert.match(skill, /not done does not get the review HTML page/);
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

test("goal-driven-queue writes one evidence page per done card", () => {
  const skill = read("skills/goal-driven-queue/SKILL.md");
  const reference = read("skills/goal-driven-queue/reference.md");
  assert.match(skill, /evidence list on the child completion report/);
  assert.match(skill, /each done card's evidence page path/);
  assert.match(skill, /The explanation \(说明\), the evidence record \(证据留痕\), and the acceptance verdict \(验收裁决\) stay separate/);
  assert.match(skill, /evidence\/<card>\.html/);
  assert.match(skill, /page title is 证据留痕/);
  assert.match(skill, /no path separator/);
  assert.match(skill, /relative path/);
  assert.match(skill, /did not open a UI/);
  assert.match(skill, /has no image/);
  assert.match(skill, /missing or empty image is pending/);
  assert.match(skill, /Do not invent an image/);
  assert.match(skill, /no checks were recorded/);
  assert.match(skill, /does not get an evidence page/);
  assert.match(skill, /enqueue shell does not write the evidence page/);
  assert.match(skill, /one link to that card's evidence page/);
  assert.match(skill, /verification\.md section records the evidence page path/);
  assert.match(reference, /Evidence page:/);
  for (const rel of [
    "skills/jira-fix-queue/SKILL.md",
    "skills/opsx-jira-fix-queue/SKILL.md",
  ]) {
    const shell = read(rel);
    assert.doesNotMatch(shell, /evidence\/<card>\.html/, rel);
    assert.doesNotMatch(shell, /证据留痕/, rel);
  }
});

test("standalone goal-driven-workflow writes an evidence page and a queue child does not", () => {
  const skill = read("skills/goal-driven-workflow/SKILL.md");
  const reference = read("skills/goal-driven-workflow/reference.md");
  assert.match(skill, /\.goal-driven\/runs\/<local-YYYYMMDD-HHmm>\/evidence\.html/);
  assert.match(skill, /page title is 证据留痕/);
  assert.match(skill, /Do not overwrite an existing directory/);
  assert.match(skill, /relative path/);
  assert.match(skill, /did not open a UI/);
  assert.match(skill, /missing or empty image is pending/);
  assert.match(skill, /Do not invent an image/);
  assert.match(skill, /no checks were recorded/);
  assert.match(skill, /an evidence list\. Each evidence item is an opened-UI check citing a png, jpg, jpeg, or webp path/);
  assert.match(skill, /evidence page path on the completion report/);
  assert.match(skill, /The explanation \(说明\), the evidence record \(证据留痕\), and the acceptance verdict \(验收裁决\) stay separate/);
  assert.match(skill, /review page links to the evidence page/);
  assert.match(skill, /evidence list/);
  assert.match(skill, /does not write the evidence HTML/);
  assert.match(reference, /Evidence page:/);
});

test("queue-child engines report an evidence list and do not write HTML", () => {
  for (const rel of [
    "skills/jira-fix-workflow/SKILL.md",
    "skills/opsx-jira-fix-workflow/SKILL.md",
    "skills/opsx-solve-workflow/SKILL.md",
    "skills/solve-workflow/SKILL.md",
  ]) {
    const skill = read(rel);
    assert.match(skill, /evidence list/, rel);
    assert.match(skill, /png, jpg, jpeg, or webp/, rel);
    assert.match(skill, /missing or empty image is pending/, rel);
    assert.match(skill, /Do not invent an image/, rel);
    assert.match(skill, /does not write the evidence HTML/, rel);
  }
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
