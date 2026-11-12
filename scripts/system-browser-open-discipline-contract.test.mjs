import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("..", import.meta.url);
const skillUrl = new URL("skills/system-browser-open-discipline/SKILL.md", root);
const agentsUrl = new URL("AGENTS.md", root);
const queueUrl = new URL("skills/goal-driven-queue/SKILL.md", root);
const workflowUrl = new URL("skills/goal-driven-workflow/SKILL.md", root);

test("system-browser-open-discipline skill file exists", () => {
  assert.equal(fs.existsSync(skillUrl), true);
});

test("system-browser-open-discipline contract", () => {
  const skill = fs.readFileSync(skillUrl, "utf8");
  assert.match(skill, /^name: system-browser-open-discipline$/m);
  assert.match(skill, /^user-invocable: true$/m);
  assert.match(skill, /^version: "1\.0\.0"$/m);

  const description = skill.split("\n").find((line) => line.startsWith("description:"));
  assert.ok(description);
  assert.match(description, /^description: ".*"$/);
  const descriptionValue = description.replace(/^description: "/, "").replace(/"$/, "");
  assert.ok(descriptionValue.length <= 1024);
  for (const phrase of [
    "「用浏览器打开」",
    "「系统浏览器打开」",
    "「打开 markdown」",
    "「打开 html」",
    "system default browser",
    "Do NOT use",
  ]) {
    assert.match(description, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(skill, /## Iron Law/);
  assert.match(skill, /system default browser/i);
  assert.match(skill, /Simple Browser|integrated browser/i);
  assert.match(skill, /Agent self-read|Read tool|normal read/i);
  assert.match(skill, /edit/i);
  assert.match(skill, /OS default/i);
  assert.match(skill, /reference\.md/);
  assert.doesNotMatch(skill, /AskUserQuestion/);
  assert.doesNotMatch(skill, /platform X uses|X 平台用/);

  const agents = fs.readFileSync(agentsUrl, "utf8");
  assert.match(agents, /system-browser-open-discipline/);
  assert.match(agents, /12\.\s*\*\*.*系统浏览器/);

  const queue = fs.readFileSync(queueUrl, "utf8");
  assert.match(queue, /system-browser-open-discipline/);
  assert.match(queue, /^  - system-browser-open-discipline$/m);

  const workflow = fs.readFileSync(workflowUrl, "utf8");
  assert.match(workflow, /system-browser-open-discipline/);
  assert.match(workflow, /^  - system-browser-open-discipline$/m);
});
