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

/**
 * 读取 modes/_index.json（若存在），返回模式列表；否则返回 null。
 */
function readModesIndex(skillDir) {
  const indexPath = path.join(skillsDir, skillDir, "modes", "_index.json");
  if (!fs.existsSync(indexPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(indexPath, "utf8"));
  } catch {
    return null;
  }
}

/**
 * 为有 modes/_index.json 的 skill 生成详细模式一览区块。
 */
function buildModesSection(skillName, modesIndex) {
  const lines = [];
  const { defaultModeId, modes } = modesIndex;

  lines.push(`### ${skillName} 模式一览`);
  lines.push("");
  lines.push(`默认模式：\`${defaultModeId}\`　共 **${modes.length}** 个模式。`);
  lines.push("");
  lines.push("| 模式 ID | 展示名 | 层级 | hookSafe | 标签 | 触发别名 |");
  lines.push("| --- | --- | --- | --- | --- | --- |");

  for (const m of modes) {
    const tier = m.tier === "core" ? "`core`" : "`extended`";
    const safe = m.hookSafe ? "✓" : "✗";
    const tags = (m.tags ?? []).map((t) => `\`${t}\``).join(" ");
    const aliases = (m.aliases ?? []).join("、");
    lines.push(
      `| \`${mdCell(m.id)}\` | ${mdCell(m.displayName)} | ${tier} | ${safe} | ${tags} | ${mdCell(aliases)} |`,
    );
  }

  // hookSafe 图例
  lines.push("");
  lines.push("> **hookSafe ✓**：Hook 自动触发（SessionStart / 里程碑等）时可使用。**✗**：仅用户主动切换。");

  return lines;
}

function main() {
  const dirs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const rows = [];
  const detailedSkills = []; // { name, modesIndex }
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

    // 检测是否有 modes/_index.json
    const modesIndex = readModesIndex(dir);
    if (modesIndex) {
      detailedSkills.push({ name, modesIndex });
    }
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

  // 详细模式区块（仅有 modes/_index.json 的 skill）
  if (detailedSkills.length > 0) {
    lines.push("", "---", "", "## 模式详情");
    lines.push("");
    lines.push("> 以下 skill 含多模式库，详细信息由 `modes/_index.json` 自动生成。");
    for (const { name, modesIndex } of detailedSkills) {
      lines.push("");
      lines.push(...buildModesSection(name, modesIndex));
    }
  }

  lines.push("", "---", "", "## 校验", "", "```bash", "node scripts/gen-skill-docs.mjs", "git diff --exit-code docs/generated/skills-index.md", "```", "");

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, lines.join("\n"), "utf8");
  console.error(`Wrote ${path.relative(root, outFile)} (${rows.length} skills)`);
}

main();
