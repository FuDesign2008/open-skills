import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("..", import.meta.url);
const skillUrl = new URL("skills/session-cleanup/SKILL.md", root);

function sectionIndex(skill, heading) {
  return skill.search(new RegExp(`^## ${heading}$`, "m"));
}

test("session-cleanup skill file exists", () => {
  assert.equal(fs.existsSync(skillUrl), true);
});

test("session-cleanup contract", () => {
  const skill = fs.readFileSync(skillUrl, "utf8");
  assert.match(skill, /^name: session-cleanup$/m);
  assert.match(skill, /^user-invocable: true$/m);
  assert.doesNotMatch(skill, /^dependencies:/m);

  const description = skill.split("\n").find((line) => line.startsWith("description:"));
  assert.ok(description);
  assert.match(description, /^description: ".*"$/);
  assert.ok(description.length < 1100);
  for (const phrase of [
    "「清理临时文件」",
    "「关闭后台服务」",
    "「会话收尾」",
    "「结束前清理」",
    "「会话清理」",
    "merge-discipline",
    "feature-branch-closeout",
    "learn-and-improve",
  ]) {
    assert.match(description, new RegExp(phrase));
  }

  const inventory = sectionIndex(skill, "Inventory");
  const preserve = sectionIndex(skill, "Preserve");
  const stop = sectionIndex(skill, "Stop");
  const remove = sectionIndex(skill, "Delete");
  const report = sectionIndex(skill, "Report");
  assert.ok(inventory >= 0);
  assert.ok(inventory < preserve);
  assert.ok(preserve < stop);
  assert.ok(stop < remove);
  assert.ok(remove < report);

  assert.match(skill, /git diff <integration> -- <path>/);
  assert.match(skill, /git show <integration>:<path>/);
  assert.match(skill, /command line/);
  assert.match(skill, /outside the delete set/);
});
