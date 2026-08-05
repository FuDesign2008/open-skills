import test from "node:test";
import assert from "node:assert/strict";
import { scanText, inScope, DENYLIST } from "./lint-skill-deidentification.mjs";

test("scanText flags denylisted tokens", () => {
  const f = scanText("see jira.mail.netease.com and YNOTR-12167");
  assert.equal(f.length, 2);
  assert.ok(f.some((x) => x.token.toLowerCase() === "netease"));
  assert.ok(f.some((x) => x.token === "YNOTR"));
});

test("scanText is case-insensitive and reports 1-based line", () => {
  const f = scanText("clean line\nYNOTE product name");
  assert.equal(f.length, 1);
  assert.equal(f[0].line, 2);
  assert.equal(f[0].token.toLowerCase(), "ynote");
});

test("scanText returns [] for generic placeholders", () => {
  assert.deepEqual(scanText("https://jira.example.com/browse/PROJ-1234  app-log"), []);
});

test("inScope: content surfaces in, generated/self/node_modules out", () => {
  assert.ok(inScope("skills/jira-read/SKILL.md"));
  assert.ok(inScope("docs/some.md"));
  assert.ok(inScope("commands/foo.md"));
  assert.ok(!inScope("docs/generated/skills-index.md"));
  assert.ok(!inScope("scripts/lint-skill-deidentification.mjs"));
  assert.ok(!inScope("node_modules/x/index.js"));
  assert.ok(!inScope("README.md")); // 根目录不在扫描范围
});

test("DENYLIST is non-empty", () => {
  assert.ok(DENYLIST.length >= 3);
});
