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

const thinPointer =
  /Before an opened-UI image supports the check, inspect it per `completion-evidence-discipline`\./;

test("authority skill owns the screenshot inspection prose", () => {
  const skill = read("skills/completion-evidence-discipline/SKILL.md");
  for (const phrase of inspection) {
    assert.match(skill, phrase);
  }
  assert.match(
    skill,
    /do not paste the Iron Law or opened-UI screenshot inspection prose/,
  );
});

test("runtime keeps a thin pointer and category-C boundary", () => {
  const runtime = read("skills/runtime-verification-discipline/SKILL.md");
  assert.match(runtime, thinPointer);
  assert.match(runtime, /This look is not category C/);
  assert.doesNotMatch(runtime, /look at the saved image in this turn/);
});

test("hosts thin-ref the authority skill instead of restating inspection", () => {
  const hosts = [
    "skills/goal-driven-queue/SKILL.md",
    "skills/goal-driven-workflow/SKILL.md",
    "skills/jira-fix-workflow/SKILL.md",
    "skills/opsx-jira-fix-workflow/SKILL.md",
    "skills/opsx-solve-workflow/SKILL.md",
    "skills/solve-workflow/SKILL.md",
  ];
  for (const rel of hosts) {
    const skill = read(rel);
    assert.match(skill, thinPointer, rel);
    assert.doesNotMatch(skill, /look at the saved image in this turn/, rel);
    assert.doesNotMatch(
      skill,
      /blank frame, a solid black frame, or an image with no readable interface/,
      rel,
    );
  }
  const queue = read("skills/goal-driven-queue/SKILL.md");
  assert.match(
    queue,
    /evidence page shows the copied image and that inspection/,
  );
  const goalRun = read("skills/goal-driven-workflow/SKILL.md");
  assert.equal(
    (goalRun.match(new RegExp(thinPointer.source, "g")) || []).length,
    2,
    "standalone and queue-child each keep one thin pointer",
  );
});
