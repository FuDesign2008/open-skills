import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import os from "os";
import path from "path";
import { checkReport } from "./check-figma-verify-report.mjs";

function report(overrides = {}) {
  const channel = overrides.channel ?? "layout-probe";
  const mounted = overrides.mounted ?? "ScreenRow";
  const command = overrides.command ?? "tool run-layout ScreenRow";
  const overall = overrides.overall ?? "PASS";
  const excerpt = overrides.excerpt ?? "width=108 height=32";
  const actual = overrides.actual ?? "108";
  const verdict = overrides.verdict ?? "PASS";
  const screenshot = overrides.screenshot ?? "not-openable";
  return `# Spec

## Verify

- Channel: ${channel}
- Mounted in: ${mounted}
- Measurement command: ${command}
- Screenshot: ${screenshot}
- Overall: ${overall}

### Measurement excerpt

\`\`\`text
${excerpt}
\`\`\`

| node / role | state | mode | property | expected | actual | verdict | notes |
|-------------|-------|------|----------|----------|--------|---------|-------|
| Segment | default | light | width | 108 | ${actual} | ${verdict} | basis: self |
`;
}

test("layout probe pass when excerpt contains the actual", () => {
  const r = checkReport(report());
  assert.equal(r.ok, true, r.errors.join("; "));
});

test("source channel is rejected", () => {
  const r = checkReport(report({ channel: "source-diff" }));
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes("Channel")));
});

test("lone mount is rejected for layout-probe", () => {
  const r = checkReport(report({ mounted: "isolated" }));
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes("shipping parent")));
});

test("actual number missing from excerpt is rejected", () => {
  const r = checkReport(report({ excerpt: "width=32", actual: "108" }));
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes("108")));
});

test("Pending overall is rejected", () => {
  const r = checkReport(report({ overall: "Pending" }));
  assert.equal(r.ok, false);
});

test("blocking verdict cannot ride an overall PASS", () => {
  const r = checkReport(report({ verdict: "DRIFT", actual: "12", excerpt: "width=12" }));
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes("DRIFT")));
});

test("layout-probe not-openable does not require an image", () => {
  const r = checkReport(report({ channel: "layout-probe", screenshot: "not-openable" }));
  assert.equal(r.ok, true, r.errors.join("; "));
});

test("openable channel without a screenshot file is rejected", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "figma-shot-"));
  const missing = checkReport(
    report({ channel: "storybook", screenshot: "missing.png" }),
    { baseDir: dir }
  );
  assert.equal(missing.ok, false);
  assert.ok(missing.errors.some((e) => /screenshot/i.test(e)));

  const empty = path.join(dir, "empty.png");
  fs.writeFileSync(empty, Buffer.alloc(0));
  const emptyResult = checkReport(
    report({ channel: "preview", screenshot: "empty.png" }),
    { baseDir: dir }
  );
  assert.equal(emptyResult.ok, false);

  const token = checkReport(report({ channel: "full-app", screenshot: "not-openable" }));
  assert.equal(token.ok, false);
});

test("openable channel accepts a non-empty image", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "figma-shot-"));
  fs.writeFileSync(path.join(dir, "ui.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const r = checkReport(
    report({ channel: "isolated-harness", screenshot: "ui.png" }),
    { baseDir: dir }
  );
  assert.equal(r.ok, true, r.errors.join("; "));
});
