import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("..", import.meta.url);

function read(rel) {
  return fs.readFileSync(new URL(rel, root), "utf8");
}

const hosts = [
  "skills/solve-workflow/SKILL.md",
  "skills/opsx-solve-workflow/SKILL.md",
  "skills/jira-fix-workflow/SKILL.md",
  "skills/opsx-jira-fix-workflow/SKILL.md",
];

test("competitive-research is the skill id and orders behavior before mechanism", () => {
  assert.equal(fs.existsSync(new URL("skills/tech-research-workflow", root)), false);
  const skill = read("skills/competitive-research/SKILL.md");
  assert.match(skill, /^name: competitive-research$/m);
  assert.match(skill, /dependencies:\n  - effective-web-research/);
  assert.match(skill, /「技术调研」/);
  assert.match(skill, /「竞品调研」/);
  assert.match(skill, /「产品调研」/);
  assert.match(skill, /「全面调研」/);
  assert.match(
    skill,
    /Record the user action and the observable result before any implementation mechanism/
  );
  assert.match(skill, /Human observation wins when it conflicts with automation/);
  assert.match(
    skill,
    /an automated keystroke counts only when the caret or focus is shown to be on the target before the key/
  );
  assert.doesNotMatch(skill, /usually steps 1–4 of the five-step method/);
  const reference = read("skills/competitive-research/reference.md");
  assert.match(reference, /Source grade \(competitor behavior claims\)/);
});

test("analysis-core loads the lean path only for user-visible outcomes", () => {
  const analysis = read("skills/analysis-core/SKILL.md");
  assert.match(analysis, /load `competitive-research`/);
  assert.doesNotMatch(analysis, /name: analysis-core[\s\S]*?dependencies:[\s\S]*- competitive-research/);
  assert.match(analysis, /result the user can see or operate/);
});

test("problem-solving hosts declare competitive-research", () => {
  for (const host of hosts) {
    const text = read(host);
    assert.match(text, / {2}- competitive-research\n/, host);
  }
});

test("known-issue-research leaves product behavior to competitive-research", () => {
  const text = read("skills/known-issue-research/SKILL.md");
  assert.match(text, /competitive-research/);
  assert.match(text, /Do NOT use for competitor product-behavior/);
});
