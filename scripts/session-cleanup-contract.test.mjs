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
  const descriptionValue = description.replace(/^description: "/, "").replace(/"$/, "");
  assert.ok(descriptionValue.length <= 1024);
  for (const phrase of [
    "「清理临时文件」",
    "「关闭后台服务」",
    "「会话收尾」",
    "「结束前清理」",
    "「会话清理」",
    "「关闭网页」",
    "「清理不用的网页」",
    "merge-discipline",
    "feature-branch-closeout",
    "learn-and-improve",
  ]) {
    assert.match(description, new RegExp(phrase));
  }

  const inventory = sectionIndex(skill, "Inventory");
  const preserve = sectionIndex(skill, "Preserve");
  const stop = sectionIndex(skill, "Stop");
  const pages = sectionIndex(skill, "Pages");
  const remove = sectionIndex(skill, "Delete");
  const reportSection = sectionIndex(skill, "Report");
  assert.ok(inventory >= 0);
  assert.ok(inventory < preserve);
  assert.ok(preserve < stop);
  assert.ok(stop < pages);
  assert.ok(pages < remove);
  assert.ok(remove < reportSection);

  const deleteSection = skill.slice(remove, reportSection);
  assert.match(deleteSection, /waits for the user to confirm the classified delete list/);

  assert.match(skill, /git diff <integration> -- <path>/);
  assert.match(skill, /git show <integration>:<path>/);
  assert.match(skill, /command line/);
  assert.match(skill, /outside the delete set/);
  assert.match(skill, /already open before this session/);
  assert.match(skill, /whose origin is unclear stays open/);
  assert.match(skill, /leaves the browser running/);
  assert.match(skill, /recorded process id/);
  assert.match(skill, /different process now bound to the port stays running/);
  assert.match(skill, /The browser that holds the pages stays running/);
  assert.match(skill, /A requested merge goes to `merge-discipline`/);
  assert.match(skill, /still unmerged/);
  assert.match(skill, /reference\.md/);

  const report = fs.readFileSync(new URL("skills/session-cleanup/reference.md", root), "utf8");
  for (const label of ["Preserved:", "Stopped:", "Closed pages:", "Deleted:", "Left in place:", "Hand off:"]) {
    assert.match(report, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
