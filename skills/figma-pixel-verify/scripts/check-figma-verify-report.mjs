#!/usr/bin/env node
/**
 * Gate a Figma living-artifact Verify section.
 * Exit 0 only when the section is a laid-out pass:
 * allowed channel, shipping mount for layout-probe, measurement excerpt,
 * and every passing actual number/color appears in that excerpt.
 */
import fs from "fs";
import path from "path";

export const CHANNELS = new Set([
  "storybook",
  "isolated-harness",
  "preview",
  "full-app",
  "layout-probe",
]);

/** Whole-value denylist: a layout probe that names only itself. */
export const LONE_MOUNT = new Set([
  "isolated",
  "self",
  "none",
  "n/a",
  "na",
  "standalone",
  "control-only",
  "view-only",
  "alone",
  "-",
]);

const OPENABLE = new Set([
  "storybook",
  "isolated-harness",
  "preview",
  "full-app",
]);

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

const BLOCKING = new Set([
  "drift",
  "missing-style",
  "hardcoded",
  "variant",
  "unmeasured",
  "pending",
]);

function field(section, name) {
  const re = new RegExp(`^- ${name}:[ \\t]*(.+)$`, "im");
  const m = section.match(re);
  return m ? m[1].trim() : "";
}

function verifySection(markdown) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((l) => /^## Verify\s*$/.test(l.trim()));
  if (start < 0) return "";
  const rest = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^## [^#]/.test(lines[i])) break;
    rest.push(lines[i]);
  }
  return rest.join("\n");
}

function excerptOf(section) {
  const lines = section.split(/\r?\n/);
  const h = lines.findIndex((l) => /^### Measurement excerpt\s*$/.test(l.trim()));
  if (h < 0) return "";
  let i = h + 1;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i >= lines.length || !lines[i].trim().startsWith("```")) return "";
  i++;
  const body = [];
  while (i < lines.length && !lines[i].trim().startsWith("```")) {
    body.push(lines[i]);
    i++;
  }
  if (i >= lines.length) return "";
  return body.join("\n").trim();
}

function splitRow(line) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function tableRows(section) {
  const lines = section.split(/\r?\n/).map((l) => l.trim());
  const headerIdx = lines.findIndex(
    (l) => l.startsWith("|") && /\bactual\b/i.test(l) && /\bverdict\b/i.test(l)
  );
  if (headerIdx < 0) return { error: "missing actual/verdict table", rows: [] };
  const headers = splitRow(lines[headerIdx]);
  const actualIdx = headers.findIndex((h) => h.toLowerCase() === "actual");
  const verdictIdx = headers.findIndex((h) => h.toLowerCase() === "verdict");
  if (actualIdx < 0 || verdictIdx < 0) {
    return { error: "table is missing actual or verdict column", rows: [] };
  }
  const rows = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const l = lines[i];
    if (!l.startsWith("|")) {
      if (rows.length) break;
      continue;
    }
    if (/^\|\s*-+/.test(l)) continue;
    const cells = splitRow(l);
    if (cells.length < headers.length) continue;
    rows.push({ actual: cells[actualIdx], verdict: cells[verdictIdx] });
  }
  return { rows };
}

function tokensOf(actual) {
  const hex = actual.match(/#[0-9a-fA-F]{3,8}/g) || [];
  const nums = actual.match(/\d+(?:\.\d+)?/g) || [];
  return { hex, nums };
}

function screenshotErrors(channel, shot, options) {
  if (!CHANNELS.has(channel)) return [];
  const value = (shot || "").trim();
  if (channel === "layout-probe" && value.toLowerCase() === "not-openable") return [];
  if (OPENABLE.has(channel) && value.toLowerCase() === "not-openable") {
    return ["Screenshot not-openable is only valid for layout-probe"];
  }
  if (!value) return ["Screenshot is empty"];
  const baseDir = options.baseDir || process.cwd();
  const resolved = path.resolve(baseDir, value);
  const ext = path.extname(resolved).toLowerCase();
  if (!IMAGE_EXT.has(ext)) {
    return ["Screenshot extension must be png, jpg, jpeg, or webp"];
  }
  try {
    const st = fs.statSync(resolved);
    if (!st.isFile() || st.size <= 0) return ["Screenshot file is empty"];
  } catch {
    return ["Screenshot file does not exist"];
  }
  return [];
}

function differentialArtifactErrors(value, options, openable, screenshotValue) {
  const text = (value || "").trim();
  if (!text) return ["Pixel differential is empty"];
  if (!openable) {
    // A layout probe has no UI screenshot to diff; a recorded note (or a cited artifact) is enough.
    return text.length >= 12 ? [] : ["Pixel differential record is too thin"];
  }
  const tokens = text.match(/[^\s,;、()[\]<>`]+\.(?:png|jpg|jpeg|webp|gif)\b/gi) || [];
  if (tokens.length === 0) {
    return ["Pixel differential must cite a side-by-side and/or diff artifact path"];
  }
  const baseDir = options.baseDir || process.cwd();
  const isFile = (p) => {
    try {
      const st = fs.statSync(p);
      return st.isFile() && st.size > 0;
    } catch {
      return false;
    }
  };
  const resolved = tokens.map((t) => path.resolve(baseDir, t));
  if (!resolved.some(isFile)) {
    return ["Pixel differential artifact file does not exist or is empty"];
  }
  const shot = (screenshotValue || "").trim();
  const shotPath = shot && shot.toLowerCase() !== "not-openable" ? path.resolve(baseDir, shot) : "";
  if (shotPath && !resolved.some((p) => p !== shotPath && isFile(p))) {
    return ["Pixel differential must cite an artifact distinct from the Screenshot file"];
  }
  return [];
}

/**
 * @param {string} markdown
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function checkReport(markdown, options = {}) {
  const errors = [];
  const section = verifySection(markdown);
  if (!section) {
    errors.push("missing ## Verify section");
    return { ok: false, errors };
  }

  const channel = field(section, "Channel");
  const mounted = field(section, "Mounted in");
  const command = field(section, "Measurement command");
  const overall = field(section, "Overall");
  const screenshotValue = field(section, "Screenshot");
  errors.push(...screenshotErrors(channel, screenshotValue, options));

  if (!CHANNELS.has(channel)) {
    errors.push(`Channel must be one of ${[...CHANNELS].join(", ")}`);
  }
  if (!mounted) errors.push("Mounted in is empty");
  if (channel === "layout-probe" && LONE_MOUNT.has(mounted.toLowerCase())) {
    errors.push("layout-probe Mounted in names a lone view, not the shipping parent");
  }
  if (!command || command.length < 4) errors.push("Measurement command is empty");

  const passOverall =
    overall === "PASS" || overall === "PASS-with-accepted-residuals";
  if (!passOverall) {
    errors.push("Overall is not PASS or PASS-with-accepted-residuals");
  }
  if (/pending/i.test(overall)) errors.push("Overall contains Pending");

  const excerpt = excerptOf(section);
  if (!excerpt) errors.push("missing ### Measurement excerpt code block");
  const excerptFold = excerpt.toLowerCase();

  const table = tableRows(section);
  if (table.error) errors.push(table.error);
  if (!table.error && table.rows.length === 0) errors.push("measurement table has no rows");

  let residual = false;
  for (const row of table.rows || []) {
    const verdict = row.verdict.trim();
    const key = verdict.toLowerCase();
    if (key === "accepted-residual") residual = true;
    if (BLOCKING.has(key)) {
      errors.push(`blocking verdict ${verdict}`);
    }
    if (key !== "pass" && key !== "accepted-residual") continue;
    const { hex, nums } = tokensOf(row.actual);
    if (hex.length === 0 && nums.length === 0) {
      const word = row.actual.trim().toLowerCase();
      if (word.length < 2 || !excerptFold.includes(word)) {
        errors.push(`actual ${row.actual} is not in the measurement excerpt`);
      }
      continue;
    }
    for (const h of hex) {
      if (!excerptFold.includes(h.toLowerCase())) {
        errors.push(`color ${h} is not in the measurement excerpt`);
      }
    }
    for (const n of nums) {
      if (!excerpt.includes(n)) {
        errors.push(`number ${n} is not in the measurement excerpt`);
      }
    }
  }
  if (residual && overall === "PASS") {
    errors.push("accepted-residual rows require Overall PASS-with-accepted-residuals");
  }

  // v1.10.0 evidence gates: reconciliation table, differential artifacts, independent re-check.
  const reconciliation = field(section, "Source reconciliation");
  const differential = field(section, "Pixel differential");
  const independent = field(section, "Independent check");
  if (!reconciliation) {
    errors.push("Source reconciliation is missing");
  } else if (/unreconciled/i.test(reconciliation)) {
    errors.push("Source reconciliation must be completed before PASS");
  } else if (!/\d+\s*\/\s*\d+/.test(reconciliation)) {
    errors.push("Source reconciliation must include N/M counts");
  }
  errors.push(...differentialArtifactErrors(differential, options, OPENABLE.has(channel), screenshotValue));
  if (!independent) {
    errors.push("Independent check is missing");
  } else if (/^unavailable\b/i.test(independent.trim())) {
    if (independent.trim().length < 40) {
      errors.push("Independent check unavailable record must name attempted methods and reason");
    }
  } else if (independent.trim().length < 12) {
    errors.push("Independent check lacks method/identity/artifact detail");
  }

  return { ok: errors.length === 0, errors };
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("usage: node check-figma-verify-report.mjs <living-artifact.md>");
    process.exit(2);
  }
  const resolved = path.resolve(file);
  const markdown = fs.readFileSync(resolved, "utf8");
  const result = checkReport(markdown, { baseDir: path.dirname(resolved) });
  if (result.ok) {
    console.log("PASS");
    process.exit(0);
  }
  for (const e of result.errors) console.error(`FAIL ${e}`);
  process.exit(1);
}

const invoked =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (invoked) main();
