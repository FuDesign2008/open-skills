import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  normalizeTarget,
  renderMarkdown,
  renderFile,
  renderEntryPage,
  readTrigger,
  maybeAutoOpen,
  openInBrowser,
} from "./render-html.mjs";

const AT = "2026-10-26T00:00:00.000Z";

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "queue-html-"));
}

function render(md, options = {}) {
  return renderMarkdown(md, {
    sourcePath: options.sourcePath || "/tmp/queue/doc.md",
    generatedAt: AT,
    root: options.root || "/tmp/queue",
    ...options,
  });
}

test("escapes HTML special characters and heading placeholders", () => {
  const html = render('# <batch-id> & "q" \'s\' <script>alert(1)</script>');
  assert.match(html, /&lt;batch-id&gt;/);
  assert.match(html, /&amp;/);
  assert.match(html, /&quot;q&quot;/);
  assert.match(html, /&#39;s&#39;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test("renders tables and honors escaped pipes", () => {
  const html = render("| A \\| B | C |\n|---|---|\n| 1 | 2 |");
  assert.match(html, /<table>/);
  assert.match(html, /<th>A \| B<\/th>/);
  assert.match(html, /<th>C<\/th>/);
  assert.match(html, /<td>1<\/td>/);
});

test("renders ordered, unordered, nested lists and read-only checkboxes", () => {
  const html = render("- [x] done\n- [ ] todo\n  - nested\n1. one\n2. two");
  assert.match(html, /<input type="checkbox" disabled checked>/);
  assert.match(html, /<input type="checkbox" disabled>/);
  assert.match(html, /<ul>/);
  assert.match(html, /<ol>/);
  assert.match(html, /<li>nested<\/li>/);
});

test("renders fenced code and does not rewrite links inside it", () => {
  const html = render("```md\n[a](a.md)\n```");
  assert.match(html, /<pre><code/);
  assert.doesNotMatch(html, /<a href/);
  assert.match(html, /\[a\]\(a.md\)/);
});

test("renders blockquotes", () => {
  const html = render("> quoted");
  assert.match(html, /<blockquote>/);
  assert.match(html, /quoted/);
});

test("rewrites a relative .md link only when its .html view exists", () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, "a.md"), "# A\n", "utf8");
  const htmlNo = render("[a](a.md)", { sourcePath: path.join(dir, "b.md"), root: dir });
  assert.match(htmlNo, /href="a\.md"/);

  fs.writeFileSync(path.join(dir, "a.html"), "<h1>A</h1>", "utf8");
  const htmlYes = render("[a](a.md#x)", { sourcePath: path.join(dir, "b.md"), root: dir });
  assert.match(htmlYes, /href="a\.html#x"/);
});

test("blocks unsafe and protocol-relative link schemes", () => {
  for (const target of [
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html,x",
    "vbscript:x",
    "file:///etc/passwd",
    "//example.com/x",
    "/root/relative",
    "\\windows\\path",
  ]) {
    const html = render(`[x](${target})`);
    assert.doesNotMatch(html, /<a href=/, target);
  }
  assert.equal(normalizeTarget("https://example.com").kind, "external");
  assert.equal(normalizeTarget("#frag").kind, "fragment");
});

test("renders local images and degrades external or missing images to alt text", () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, "img.png"), "not-a-real-png", "utf8");
  const local = render("![alt](img.png)", { sourcePath: path.join(dir, "doc.md"), root: dir });
  assert.match(local, /<img src="img\.png" alt="alt">/);

  const external = render("![alt](https://example.com/x.png)");
  assert.doesNotMatch(external, /<img /);
  assert.match(external, /alt/);

  const missing = render("![alt](missing.png)", { sourcePath: path.join(dir, "doc.md"), root: dir });
  assert.doesNotMatch(missing, /<img /);
});

test("writes a footer with the source path, source label, and generation time", () => {
  const html = render("# T", { sourceLabel: "/child/worktree/report.md" });
  assert.match(html, /<footer>/);
  assert.match(html, /\/tmp\/queue\/doc\.md/);
  assert.match(html, /\/child\/worktree\/report\.md/);
  assert.match(html, new RegExp(AT));
});

test("output is self-contained and UTF-8 with non-ASCII round-trip", () => {
  const html = render("# 标题\n\n正文");
  assert.match(html, /<meta charset="utf-8">/);
  assert.match(html, /标题/);
  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /<link[^>]+stylesheet/i);
  assert.doesNotMatch(html, /@import/i);
  assert.doesNotMatch(html, /src="https?:/i);
});

test("is deterministic for the same source and generation time", () => {
  const a = render("# T\n\nbody");
  const b = render("# T\n\nbody");
  assert.equal(a, b);
});

test("does not modify the Markdown source", () => {
  const dir = tmp();
  const source = path.join(dir, "doc.md");
  const original = "# T\n\nbody\n";
  fs.writeFileSync(source, original, "utf8");
  renderFile(source, { root: dir, generatedAt: AT });
  assert.equal(fs.readFileSync(source, "utf8"), original);
  assert.ok(fs.existsSync(path.join(dir, "doc.html")));
});

test("reads the recorded trigger and opens only for interactive", () => {
  const dir = tmp();
  const page = path.join(dir, "verification.html");
  fs.writeFileSync(page, "<html></html>", "utf8");

  const interactive = path.join(dir, "progress.md");
  fs.writeFileSync(interactive, "- Trigger: interactive\n", "utf8");
  assert.equal(readTrigger(interactive), "interactive");

  const scheduled = path.join(dir, "progress-scheduled.md");
  fs.writeFileSync(scheduled, "- Trigger: scheduled\n", "utf8");
  assert.equal(readTrigger(scheduled), "scheduled");

  const calls = [];
  const spawnFn = (command, args) => {
    calls.push({ command, args });
    return { unref() {} };
  };

  const opened = maybeAutoOpen({ trigger: "interactive", filePath: page, root: dir, spawnFn });
  assert.equal(opened.opened, true);
  assert.equal(calls.length, 1);

  const skipped = maybeAutoOpen({ trigger: "scheduled", filePath: page, root: dir, spawnFn });
  assert.equal(skipped.opened, false);
  assert.equal(calls.length, 1);
});

test("entry page links every category and annotates missing targets", () => {
  const dir = tmp();
  for (const rel of [
    "progress.html",
    "triage.html",
    "done-card.html",
    "failed-card.html",
    "skipped-card.html",
    "reports/done-card.html",
    "reports/failed-card.html",
    "review/done-card.html",
    "evidence/done-card.html",
  ]) {
    const absolute = path.join(dir, rel);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, "<html></html>", "utf8");
  }

  const html = renderEntryPage({
    batchId: "b1",
    generatedAt: AT,
    root: dir,
    entryPath: path.join(dir, "verification.html"),
    progressPath: "progress.html",
    triagePath: "triage.html",
    cards: [
      {
        slug: "done-card",
        status: "done",
        viewPath: "done-card.html",
        reportPath: "reports/done-card.html",
        reviewPath: "review/done-card.html",
        evidencePath: "evidence/done-card.html",
      },
      {
        slug: "failed-card",
        status: "failed",
        viewPath: "failed-card.html",
        reportPath: "reports/failed-card.html",
      },
      { slug: "skipped-card", status: "skipped", viewPath: "skipped-card.html" },
    ],
  });

  assert.match(html, /href="progress\.html"/);
  assert.match(html, /href="triage\.html"/);
  assert.match(html, /href="done-card\.html"/);
  assert.match(html, /href="review\/done-card\.html"/);
  assert.match(html, /href="evidence\/done-card\.html"/);
  assert.match(html, /href="reports\/failed-card\.html"/);
  assert.match(html, /Review failed-card: <em>unavailable<\/em>/);
  assert.match(html, /Evidence failed-card: <em>unavailable<\/em>/);
  assert.match(html, /Report skipped-card: <em>unavailable<\/em>/);
  assert.match(html, /Review skipped-card: <em>unavailable<\/em>/);

  const zeroDone = renderEntryPage({
    batchId: "b0",
    generatedAt: AT,
    root: dir,
    entryPath: path.join(dir, "verification.html"),
    progressPath: "progress.html",
    triagePath: "triage.html",
    cards: [{ slug: "skipped-card", status: "skipped", viewPath: "skipped-card.html" }],
  });
  assert.match(zeroDone, /Review skipped-card: <em>unavailable<\/em>/);
});

test("open action is path-contained and shell-free", () => {
  const dir = tmp();
  const outside = tmp();
  const page = path.join(dir, "verification.html");
  fs.writeFileSync(page, "<html></html>", "utf8");
  fs.writeFileSync(path.join(outside, "x.html"), "<html></html>", "utf8");

  const calls = [];
  const spawnFn = (command, args) => {
    calls.push({ command, args });
    return { unref() {} };
  };

  const result = openInBrowser(page, { root: dir, spawnFn });
  assert.equal(result.opened, true);
  assert.equal(calls.length, 1);
  assert.ok(Array.isArray(calls[0].args));
  assert.ok(calls[0].args.includes(page));

  assert.throws(
    () => openInBrowser(path.join(outside, "x.html"), { root: dir, spawnFn }),
    /outside the queue root/,
  );
  assert.equal(calls.length, 1);
});
