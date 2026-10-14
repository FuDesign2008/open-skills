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
  const recon = overrides.recon ?? "12/12 (0 added, 0 out-of-scope)";
  const diff = overrides.diff ?? "not-available: layout-probe has no UI screenshot";
  const indie = overrides.indie ?? "blind re-source check by reviewer-agent; artifact: review.md";
  return `# Spec

## Verify

- Channel: ${channel}
- Mounted in: ${mounted}
- Measurement command: ${command}
- Screenshot: ${screenshot}
- Source reconciliation: ${recon}
- Pixel differential: ${diff}
- Independent check: ${indie}
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
  fs.writeFileSync(path.join(dir, "side.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const r = checkReport(
    report({ channel: "isolated-harness", screenshot: "ui.png", diff: "side.png" }),
    { baseDir: dir }
  );
  assert.equal(r.ok, true, r.errors.join("; "));
});

test("missing Source reconciliation is rejected", () => {
  const r = checkReport(report({ recon: "" }));
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /reconciliation/i.test(e)));
});

test("unreconciled marker is rejected", () => {
  const r = checkReport(report({ recon: "UNRECONCILED" }));
  assert.equal(r.ok, false);
});

test("openable channel diff citing a missing artifact is rejected", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "figma-diff-"));
  fs.writeFileSync(path.join(dir, "ui.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const r = checkReport(
    report({ channel: "preview", screenshot: "ui.png", diff: "missing-side.png" }),
    { baseDir: dir }
  );
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /differential/i.test(e)));
});

test("missing Independent check is rejected", () => {
  const r = checkReport(report({ indie: "" }));
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /independent/i.test(e)));
});

test("independent check unavailable needs attempted methods and reason", () => {
  const thin = checkReport(report({ indie: "unavailable" }));
  assert.equal(thin.ok, false);
  const recorded = checkReport(
    report({
      indie:
        "unavailable: tried fresh-agent run and cross-model check, neither available in this environment",
    })
  );
  assert.equal(recorded.ok, true, recorded.errors.join("; "));
});

test("differential reusing the Screenshot path is rejected", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "figma-diff-reuse-"));
  fs.writeFileSync(path.join(dir, "ui.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const r = checkReport(
    report({ channel: "preview", screenshot: "ui.png", diff: "ui.png" }),
    { baseDir: dir }
  );
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /distinct from the Screenshot/i.test(e)));
});

test("case-mixed Screenshot path reuse is still rejected", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "figma-diff-case-"));
  fs.writeFileSync(path.join(dir, "UI.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const r = checkReport(
    report({ channel: "preview", screenshot: "UI.png", diff: "UI.png" }),
    { baseDir: dir }
  );
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /distinct from the Screenshot/i.test(e)));
});

test("punctuation-separated differential refs resolve", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "figma-diff-punct-"));
  fs.writeFileSync(path.join(dir, "ui.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  fs.writeFileSync(path.join(dir, "side.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const r = checkReport(
    report({ channel: "preview", screenshot: "ui.png", diff: "side.png,diff.png" }),
    { baseDir: dir }
  );
  assert.equal(r.ok, true, r.errors.join("; "));
});

test("empty differential is rejected", () => {
  const r = checkReport(
    report({ diff: "", indie: "blind re-source check by reviewer-agent" })
  );
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /differential/i.test(e)));
});

test("thin layout-probe differential record is rejected", () => {
  const r = checkReport(report({ diff: "note" }));
  assert.equal(r.ok, false);
});

test("reconciliation without N/M counts is rejected", () => {
  const r = checkReport(report({ recon: "skipped" }));
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /N\/M/.test(e)));
});
