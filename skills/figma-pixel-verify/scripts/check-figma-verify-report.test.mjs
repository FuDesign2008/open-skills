import test from "node:test";
import assert from "node:assert/strict";
import { checkReport } from "./check-figma-verify-report.mjs";

function report(overrides = {}) {
  const channel = overrides.channel ?? "layout-probe";
  const mounted = overrides.mounted ?? "ScreenRow";
  const command = overrides.command ?? "tool run-layout ScreenRow";
  const overall = overrides.overall ?? "PASS";
  const excerpt = overrides.excerpt ?? "width=108 height=32";
  const actual = overrides.actual ?? "108";
  const verdict = overrides.verdict ?? "PASS";
  return `# Spec

## Verify

- Channel: ${channel}
- Mounted in: ${mounted}
- Measurement command: ${command}
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
