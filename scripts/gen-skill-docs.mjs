#!/usr/bin/env node
/**
 * 从 skills 各子目录下 SKILL.md 的 YAML frontmatter 生成 docs/generated/skills-index.md
 * 零依赖；修改 skills 后请运行：node scripts/gen-skill-docs.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const skillsDir = path.join(root, "skills");
const outDir = path.join(root, "docs", "generated");
const outFile = path.join(outDir, "skills-index.md");

function parseFrontmatter(block) {
  const data = {};
  for (const line of block.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (val === "true") data[key] = true;
    else if (val === "false") data[key] = false;
    else data[key] = val;
  }
  return data;
}

function readSkillMeta(skillPath) {
  const raw = fs.readFileSync(skillPath, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) {
    throw new Error(`Missing frontmatter: ${skillPath}`);
  }
  return parseFrontmatter(m[1]);
}

function mdCell(s) {
  if (s == null) return "";
  return String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

function main() {
  const dirs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const rows = [];
  for (const dir of dirs) {
    const skillMd = path.join(skillsDir, dir, "SKILL.md");
    if (!fs.existsSync(skillMd)) continue;
    const meta = readSkillMeta(skillMd);
    const name = meta.name;
    if (!name || name !== dir) {
      throw new Error(
        `SKILL name must match directory: ${dir} vs name=${meta.name}`,
      );
    }
    rows.push({
      name,
      version: meta.version ?? "—",
      userInvocable:
        meta["user-invocable"] === true
          ? "是"
          : meta["user-invocable"] === false
            ? "否"
            : "—",
      description: meta.description ?? "—",
    });
  }

  if (rows.length === 0) {
    throw new Error("No skills found");
  }

  const now = new Date().toISOString().slice(0, 10);
  const lines = [
    "# Skills 索引（自动生成）",
    "",
    `> **请勿手改。** 源数据：\`skills/<name>/SKILL.md\`。生成时间：${now}。`,
    "> ",
    "> 变更 skill 后在本仓库根目录执行：\`node scripts/gen-skill-docs.mjs\`",
    "",
    `本仓库当前共 **${rows.length}** 个 skill。`,
    "",
    "| Skill | 版本 | 用户可唤起 | 描述（含触发条件） |",
    "| --- | --- | --- | --- |",
  ];

  for (const r of rows) {
    lines.push(
      `| **${mdCell(r.name)}** | ${mdCell(r.version)} | ${mdCell(r.userInvocable)} | ${mdCell(r.description)} |`,
    );
  }

  lines.push("", "---", "", "## 校验", "", "```bash", "node scripts/gen-skill-docs.mjs", "git diff --exit-code docs/generated/skills-index.md", "```", "");

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, lines.join("\n"), "utf8");
  console.error(`Wrote ${path.relative(root, outFile)} (${rows.length} skills)`);
}

main();
