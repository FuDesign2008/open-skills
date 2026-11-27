import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("..", import.meta.url);
const skillUrl = new URL("skills/html-explain/SKILL.md", root);
const agentsUrl = new URL("AGENTS.md", root);
const referenceUrl = new URL("skills/html-explain/reference.md", root);
const shellUrl = new URL("skills/html-explain/assets/page-shell.html", root);

test("html-explain skill file exists", () => {
  assert.equal(fs.existsSync(skillUrl), true);
});

test("html-explain contract", () => {
  const skill = fs.readFileSync(skillUrl, "utf8");
  assert.match(skill, /^name: html-explain$/m);
  assert.match(skill, /^user-invocable: true$/m);
  assert.match(skill, /^version: "1\.1\.0"$/m);
  assert.match(skill, /^  - system-browser-open-discipline$/m);

  const depsBlock = skill.match(/^dependencies:\n((?:  - .+\n)*)/m);
  assert.ok(depsBlock, "dependencies block present");
  assert.match(depsBlock[0], /system-browser-open-discipline/);
  assert.doesNotMatch(depsBlock[0], /explain-clearly/);

  const description = skill.split("\n").find((line) => line.startsWith("description:"));
  assert.ok(description);
  assert.match(description, /^description: ".*"$/);
  const descriptionValue = description.replace(/^description: "/, "").replace(/"$/, "");
  assert.ok(descriptionValue.length <= 1024);

  for (const phrase of [
    "/html-explain",
    "「用 HTML 解释」",
    "「HTML 解释这个 MR」",
    "「解释这个合并请求」",
    "「看不懂这个改动」",
    "explain-clearly",
    "teach",
    "tech-review-doc",
  ]) {
    assert.match(description, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(skill, /lightweight|Lightweight/i);
  assert.match(skill, /[Ee]scalat/);
  assert.match(skill, /\.html-explain\//);
  assert.match(skill, /system-browser-open-discipline/);
  assert.match(skill, /abort/i);
  assert.match(skill, /reference\.md/);
  assert.match(skill, /assets\/page-shell\.html/);
  assert.doesNotMatch(skill, /AskUserQuestion/);
  assert.doesNotMatch(skill, /platform X uses|X 平台用/);

  const agents = fs.readFileSync(agentsUrl, "utf8");
  assert.match(
    agents,
    /\| html-explain \| 工具 \| system-browser-open-discipline（轻量 HTML 解释 MR\/diff；必要时 optional 加载 explain-clearly；强依赖系统浏览器纪律） \|/,
  );

  const reference = fs.readFileSync(referenceUrl, "utf8");
  assert.match(reference, /example\.com/);
  assert.match(reference, /merge_requests\/123/);
  assert.match(reference, /What changed|Why it matters|Key files/i);

  const shell = fs.readFileSync(shellUrl, "utf8");
  assert.match(shell, /what-changed|What changed/i);
  assert.match(shell, /<style/i);
  assert.doesNotMatch(shell, /<script/i);
  assert.match(shell, /color-scheme:\s*light dark/);
  assert.doesNotMatch(shell, /color-scheme:\s*light\s*;/);
  assert.match(shell, /--bg\b/);
  assert.match(shell, /prefers-color-scheme:\s*dark/);
});
