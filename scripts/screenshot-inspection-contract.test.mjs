import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("..", import.meta.url);
const read = (rel) => fs.readFileSync(new URL(rel, root), "utf8");

const inspection = [
  /look at the saved image in this turn/,
  /blank frame, a solid black frame, or an image with no readable interface/,
  /not the screen this check was supposed to open/,
  /expected screen and what the image shows/,
  /image was not inspected/,
  /Do not treat any of those as the expected capture/,
];

function assertInspection(rel) {
  const skill = read(rel);
  for (const phrase of inspection) {
    assert.match(skill, phrase, rel);
  }
}

test("pass claims and runtime checks inspect the screenshot", () => {
  assertInspection("skills/completion-evidence-discipline/SKILL.md");
  assertInspection("skills/runtime-verification-discipline/SKILL.md");
  const runtime = read("skills/runtime-verification-discipline/SKILL.md");
  assert.match(runtime, /This look is not category C/);
});

test("evidence pages record the screenshot inspection", () => {
  assertInspection("skills/goal-driven-queue/SKILL.md");
  assertInspection("skills/goal-driven-workflow/SKILL.md");
  for (const rel of [
    "skills/jira-fix-workflow/SKILL.md",
    "skills/opsx-jira-fix-workflow/SKILL.md",
    "skills/opsx-solve-workflow/SKILL.md",
    "skills/solve-workflow/SKILL.md",
  ]) {
    assertInspection(rel);
  }
});
