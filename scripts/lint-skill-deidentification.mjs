#!/usr/bin/env node
/**
 * 脱敏门禁:检测 skills/commands/docs 中的内部标识符(内部域名/产品名/项目代号)。
 * 配套 AGENTS.md 铁律 2(数据脱敏),把"靠人工自觉"升级为"机器强制"——
 * 这是全仓 YNOTR/ynote/netease 反复泄漏(见 issue #267)的根因修复。
 *
 * 三种模式:
 *   全量(默认 / npm run lint:deid):扫描全仓内容表面,列出所有命中 → 推动清理存量。
 *   --staged :只扫暂存区新增行(git diff --cached 的 + 行)→ pre-commit 用,"禁止新增泄漏"。
 *   --base <ref>:只扫相对 <ref> 的新增行(git diff <ref>...HEAD)→ CI 用,校验 PR diff 不引入新泄漏。
 *
 * 自排除:本脚本含 denylist 字面量,扫描时跳过自身与 docs/generated/(自动生成)。
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "..");
const SELF = path.relative(root, __filename).split(path.sep).join("/"); // scripts/lint-skill-deidentification.mjs

// 内部标识符 denylist(发现新的内部信息时按需扩充)。
// 说明:detect 用的清单本身含敏感字面量,这是检测器的必要组成,扫描时自排除。
export const DENYLIST = ["netease", "ynote", "YNOTR"];

const TEXT_EXT = new Set([".md", ".json", ".sh", ".mjs", ".js", ".ts", ".yaml", ".yml", ".txt"]);
const SCOPE_PREFIXES = ["skills/", "commands/", "docs/"];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const PATTERN = new RegExp(DENYLIST.map(escapeRegex).join("|"), "gi");

/** 扫描文本,返回命中列表 {line, column, token, snippet}。大小写不敏感。 */
export function scanText(text) {
  const findings = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    PATTERN.lastIndex = 0;
    let m;
    while ((m = PATTERN.exec(line)) !== null) {
      findings.push({
        line: i + 1,
        column: m.index + 1,
        token: m[0],
        snippet: line.trim().slice(0, 100),
      });
      if (m.index === PATTERN.lastIndex) PATTERN.lastIndex++; // 防零宽死循环
    }
  });
  return findings;
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

/** 判断相对路径是否在扫描范围内。 */
export function inScope(rel) {
  rel = toPosix(rel);
  if (rel === SELF) return false;
  if (rel.startsWith("docs/generated/")) return false;
  if (rel.startsWith("node_modules/")) return false;
  if (!SCOPE_PREFIXES.some((s) => rel.startsWith(s))) return false;
  return TEXT_EXT.has(path.extname(rel).toLowerCase());
}

/** 递归收集全量模式下需扫描的文件(相对 root 的 posix 路径)。 */
function collectFullFiles() {
  const out = [];
  for (const prefix of SCOPE_PREFIXES) {
    const dir = path.join(root, prefix);
    if (!fs.existsSync(dir)) continue;
    walk(dir, out);
  }
  return out.sort();
}
function walk(absDir, out) {
  for (const e of fs.readdirSync(absDir, { withFileTypes: true })) {
    const abs = path.join(absDir, e.name);
    const rel = toPosix(path.relative(root, abs));
    if (e.isDirectory()) walk(abs, out);
    else if (inScope(rel)) out.push(rel);
  }
}

/** 解析 `git diff` 统一输出,提取每个文件的新增行(+ 行)。diffArgs 透传给 git diff。 */
export function addedLinesFromDiff(diffArgs) {
  const out = execSync(`git diff ${diffArgs} -U0 --no-color`, {
    cwd: root,
    maxBuffer: 1024 * 1024 * 64,
    encoding: "utf8",
  });
  const groups = []; // { file, lines: [] }
  let cur = null;
  for (const line of out.split(/\r?\n/)) {
    if (line.startsWith("+++ b/")) {
      cur = { file: line.slice(6), lines: [] };
      groups.push(cur);
    } else if (line.startsWith("+") && cur) {
      cur.lines.push(line.slice(1));
    }
  }
  return groups;
}

function formatFindings(findings) {
  return findings
    .map((f) => `    L${f.line}:${f.column}  '${f.token}'  ${f.snippet}`)
    .join("\n");
}

function runFull() {
  const files = collectFullFiles();
  let total = 0;
  for (const rel of files) {
    const findings = scanText(fs.readFileSync(path.join(root, rel), "utf8"));
    if (findings.length) {
      total += findings.length;
      console.error(`❌ ${rel}  (${findings.length})`);
      console.error(formatFindings(findings));
    }
  }
  if (total > 0) {
    console.error(
      `\n共 ${total} 处疑似内部标识符命中(铁律 2 数据脱敏)。请替换为通用占位(example.com / PROJ / app)。`
    );
    console.error(
      "存量清理见 issue #267;全量模式用于推动清理,pre-commit/CI 使用 --staged/--base 只拦新增。"
    );
    process.exit(1);
  }
  console.log(`✅ 脱敏全量扫描通过:${files.length} 个文件,无内部标识符命中。`);
}

function runAddedLineMode(diffArgs, label) {
  const groups = addedLinesFromDiff(diffArgs).filter((g) => inScope(g.file));
  let total = 0;
  for (const g of groups) {
    const findings = scanText(g.lines.join("\n"));
    if (findings.length) {
      total += findings.length;
      console.error(`❌ ${g.file}  新增行命中 (${findings.length})`);
      console.error(formatFindings(findings));
    }
  }
  if (total > 0) {
    console.error(
      `\n${label}:检测到 ${total} 处新增内部标识符(铁律 2)。请替换为通用占位后再提交。`
    );
    process.exit(1);
  }
  console.log(`✅ ${label}:无新增内部标识符。`);
}

// CLI(被 import 做单元测试时不执行)
const isMain = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes("--staged")) {
    runAddedLineMode("--cached", "pre-commit (--staged)");
  } else if (args.includes("--base")) {
    const ref = args[args.indexOf("--base") + 1];
    if (!ref) {
      console.error("--base 需要一个 git ref 参数,例如 --base origin/main");
      process.exit(2);
    }
    runAddedLineMode(`${ref}...HEAD`, `CI (--base ${ref})`);
  } else {
    runFull();
  }
}
