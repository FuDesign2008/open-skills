import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("..", import.meta.url);
const skillUrl = new URL("skills/explain-clearly/SKILL.md", root);
const shellUrl = new URL("skills/explain-clearly/assets/explanation-shell.html", root);

test("explain-clearly skill file exists", () => {
  assert.equal(fs.existsSync(skillUrl), true);
});

test("explain-clearly contract", () => {
  const skill = fs.readFileSync(skillUrl, "utf8");
  assert.match(skill, /^name: explain-clearly$/m);
  assert.match(skill, /^user-invocable: true$/m);

  const description = skill.split("\n").find((line) => line.startsWith("description:"));
  assert.ok(description);
  assert.match(description, /^description: ".*"$/);
  const descriptionValue = description.replace(/^description: "/, "").replace(/"$/, "");
  assert.ok(descriptionValue.length <= 1024);
  for (const phrase of [
    "「X 是什么」",
    "「为什么需要 X」",
    "「用大白话解释 X」",
    "「帮我理解 X」",
    "teach",
    "article-writer",
    "tech-review-doc",
  ]) {
    assert.match(description, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(skill, /\.explain-clearly\//);
  assert.match(skill, /current session/);
  assert.match(skill, /HTML/);
  assert.match(skill, /Markdown/);
  assert.match(skill, /plain text/);
  assert.match(skill, /auxiliary/);
  assert.match(skill, /assets\/explanation-shell\.html/);
  assert.match(skill, /reference for structure/);
  assert.match(skill, /user's language/);
  assert.match(skill, /file path/);
  assert.match(skill, /role-handoff flow/);
  assert.match(skill, /diagram is the explanation/);
  assert.match(skill, /comparison table does not satisfy/);
  assert.match(skill, /put the diagram section before the four prose sections/);
  assert.doesNotMatch(skill, /xdg-open|open -a/);
  assert.doesNotMatch(skill, /copy `assets\/explanation-shell\.html`/);

  const shell = fs.readFileSync(shellUrl, "utf8");
  assert.match(shell, /Reference layout only/);
  assert.match(shell, /<style/i);
  assert.doesNotMatch(shell, /<script/i);
  assert.match(shell, /move this section before the four prose sections/);
  assert.match(shell, /A comparison table does not fill this slot/);
});
