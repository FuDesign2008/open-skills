import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  normalizeTarget,
  renderMarkdown,
  renderNav,
  writeRenderedFile,
} from "../../report-output-discipline/scripts/render-core.mjs";

const renderFile = writeRenderedFile;

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
  assert.doesNotMatch(html, /<script[^>]*src=/i);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test("renders tables and honors escaped pipes", () => {
  const html = render("| A \\| B | C |\n|---|---|\n| 1 | 2 |");
  assert.match(html, /<table>/);
  assert.match(html, /<th>A \| B<\/th>/);
  assert.match(html, /<th>C<\/th>/);
  assert.match(html, /<td>1<\/td>/);
});

test("wraps tables in a horizontal scroll container so wide tables stay readable", () => {
  const html = render("| A | B |\n|---|---|\n| 1 | 2 |");
  assert.match(html, /<div class="table-wrap"><table>/);
  assert.match(html, /<\/table><\/div>/);
});

test("renders wide tables as labeled record cards instead of crushed columns", () => {
  const html = render("| A | B | C | D | E | F | G |\n|---|---|---|---|---|---|---|\n| 1 | 2 | 3 | 4 | 5 | 6 | 7 |");
  assert.match(html, /<dl class="record-list"><div class="record">/);
  assert.match(html, /<dt>A<\/dt><dd>1<\/dd>/);
  assert.match(html, /<dt>G<\/dt><dd>7<\/dd>/);
  assert.doesNotMatch(html, /<table>/);
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
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.equal((html.match(/<script>/g) || []).length, 1, "only the inline lightbox script is allowed");
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

test("injects a cross-navigation block with relative links and unavailable markers", () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, "verification.html"), "", "utf8");
  fs.writeFileSync(path.join(dir, "progress.html"), "", "utf8");
  fs.writeFileSync(path.join(dir, "card.md"), "# Card\n", "utf8");

  renderFile(path.join(dir, "card.md"), {
    root: dir,
    navRoot: dir,
    generatedAt: AT,
    nav: [
      { label: "入口", path: "verification.html" },
      { label: "进度", path: "progress.html" },
      { label: "报告", path: "missing.html" },
    ],
    unavailableLabel: "不可用",
  });

  const html = fs.readFileSync(path.join(dir, "card.html"), "utf8");
  assert.match(html, /<nav class="queue-nav"/);
  assert.match(html, /href="verification\.html"/);
  assert.match(html, /href="progress\.html"/);
  assert.match(html, /报告（不可用）/);
});

test("linkifies plain URLs in body text but not inside code spans", () => {
  const html = render("See https://example.com/x and `https://example.com/y`.");
  assert.match(html, /<a href="https:\/\/example\.com\/x">https:\/\/example\.com\/x<\/a>/);
  assert.match(html, /<code>https:\/\/example\.com\/y<\/code>/);
  assert.doesNotMatch(html, /<a href="https:\/\/example\.com\/y"/);
});

test("stops a plain URL at CJK punctuation", () => {
  const html = render("MR：https://example.com/pull/341；见（https://example.com/x）。");
  assert.match(html, /<a href="https:\/\/example\.com\/pull\/341">https:\/\/example\.com\/pull\/341<\/a>；见/);
  assert.match(html, /<a href="https:\/\/example\.com\/x">https:\/\/example\.com\/x<\/a>）。/);
  assert.doesNotMatch(html, /href="https:\/\/example\.com\/pull\/341；/);
});

test("links inline file paths that exist and leaves commands plain", () => {
  const workspace = tmp();
  fs.mkdirSync(path.join(workspace, "skills/demo"), { recursive: true });
  fs.writeFileSync(path.join(workspace, "skills/demo/SKILL.md"), "# demo\n", "utf8");
  const source = path.join(workspace, "doc.md");
  fs.writeFileSync(source, "See `skills/demo/SKILL.md` and run `npm test`.\n", "utf8");

  renderFile(source, { root: workspace, fileRoot: workspace, generatedAt: AT });

  const html = fs.readFileSync(path.join(workspace, "doc.html"), "utf8");
  assert.match(html, /class="file-link"/);
  assert.match(html, /href="skills\/demo\/SKILL\.md"/);
  assert.match(html, /<code>npm test<\/code>/);
  assert.doesNotMatch(html, /file-link[^>]*>npm test/);
});

test("links bare file and directory names by existence, not by extension", () => {
  const workspace = tmp();
  fs.writeFileSync(path.join(workspace, "config"), "x\n", "utf8");
  fs.mkdirSync(path.join(workspace, "scripts"), { recursive: true });
  const source = path.join(workspace, "doc.md");
  fs.writeFileSync(source, "See `config` and `scripts/`; keep `md` and `notes/*.md` plain.\n", "utf8");

  renderFile(source, { root: workspace, fileRoot: workspace, generatedAt: AT });

  const html = fs.readFileSync(path.join(workspace, "doc.html"), "utf8");
  assert.match(html, /class="file-link" href="config"/);
  assert.match(html, /class="file-link" href="scripts"/);
  assert.match(html, /<code>md<\/code>/);
  assert.match(html, /<code>notes\/\*\.md<\/code>/);
});

test("marks the current page in the navigation even before its file exists", () => {
  const root = tmp();
  fs.writeFileSync(path.join(root, "progress.html"), "", "utf8");
  const nav = renderNav(
    [
      { label: "Entry", path: "verification.html" },
      { label: "Progress", path: "progress.html" },
      { label: "Missing", path: "missing.html" },
    ],
    { root, fromPath: path.join(root, "verification.html"), unavailableLabel: "unavailable" },
  );
  assert.match(nav, /<a href="verification\.html" aria-current="page">Entry<\/a>/);
  assert.match(nav, /<a href="progress\.html">Progress<\/a>/);
  assert.match(nav, /queue-nav-unavailable/);
});

test("Markdown local images are lightbox-activatable", () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, "img.png"), "not-a-real-png", "utf8");
  const html = render("![alt text](img.png)", { sourcePath: path.join(dir, "doc.md"), root: dir });
  assert.match(html, /data-lightbox/);
  assert.match(html, /<img src="img\.png" alt="alt text"/);
  assert.match(html, /lightbox-trigger/);
  assert.match(html, /showModal/);
});

test("English Markdown lightbox chrome follows lang", () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, "img.png"), "x", "utf8");
  const html = render("![photo](img.png)", {
    sourcePath: path.join(dir, "doc.md"),
    root: dir,
    lang: "en",
  });
  assert.match(html, /aria-label="Enlarge image: photo"/);
  assert.match(html, /aria-label="Enlarged image"/);
  assert.match(html, /aria-label="Close"/);
  assert.doesNotMatch(html, /放大图片/);
});

test("lightbox dialog is full-viewport so backdrop clicks hit the dialog", () => {
  const html = render("# T\n\nbody");
  assert.match(html, /#queue-lightbox\s*\{[^}]*width:\s*100%/);
  assert.match(html, /#queue-lightbox\s*\{[^}]*height:\s*100%/);
  assert.match(html, /setAttribute\("aria-label"/);
  assert.match(html, /data-default-label="/);
});

test("pages without content images still include lightbox shell but need no image affordance", () => {
  const html = render("# T\n\nbody only");
  assert.match(html, /id="queue-lightbox"/);
  assert.doesNotMatch(html, /<button[^>]*class="lightbox-trigger"/);
  assert.doesNotMatch(html, /<img /);
  const dir = tmp();
  fs.writeFileSync(path.join(dir, "img.png"), "x", "utf8");
  const withImg = render("![x](img.png)", { sourcePath: path.join(dir, "doc.md"), root: dir });
  assert.match(withImg, /<button[^>]*class="lightbox-trigger"/);
});
