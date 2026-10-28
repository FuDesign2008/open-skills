// Minimal Mermaid flowchart -> inline SVG renderer.
// Supported subset: flowchart/graph with TB/TD/LR/BT/RL, node shapes
// [] () {} ([]) (()), edges --> --- --x with optional |label|, and subgraph.
// Anything outside the subset degrades as a whole graph; we never silently drop.

const NODE_SHAPES = [
  { open: "([", close: "])", shape: "stadium" },
  { open: "((", close: "))", shape: "circle" },
  { open: "[", close: "]", shape: "rect" },
  { open: "(", close: ")", shape: "round" },
  { open: "{", close: "}", shape: "diamond" },
];

const UNSUPPORTED = [
  /(^|\s)classDef(\s|$)/,
  /(^|\s)class(\s|$)/,
  /(^|\s)style(\s|$)/,
  /(^|\s)linkStyle(\s|$)/,
  /(^|\s)click(\s|$)/,
  /<br\s*\/?>/i,
  /&[a-zA-Z#0-9]+;/,
  /:::/,
];

const EDGE_RE = /^([A-Za-z0-9_]+)(\[[^\]]*\]|\([^)]*\)|\{[^}]*\}|\(\[[^\]]*\]\)|\(\([^)]*\)\))?\s*(-->|---|--x)\s*(?:\|([^|]*)\|\s*)?([A-Za-z0-9_]+)(\[[^\]]*\]|\([^)]*\)|\{[^}]*\}|\(\[[^\]]*\]\)|\(\([^)]*\)\))?$/;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textWidth(text) {
  let units = 0;
  for (const char of String(text)) {
    units += /[⺀-鿿＀-￯]/.test(char) ? 2 : 1;
  }
  return units * 7.6;
}

function parseNode(token) {
  const idMatch = /^([A-Za-z0-9_]+)/.exec(token);
  if (!idMatch) return null;
  const id = idMatch[1];
  const rest = token.slice(id.length).trim();
  if (!rest) return { id, label: id, shape: "rect" };
  for (const entry of NODE_SHAPES) {
    if (rest.startsWith(entry.open) && rest.endsWith(entry.close)) {
      const label = rest.slice(entry.open.length, rest.length - entry.close.length).trim();
      return { id, label: label || id, shape: entry.shape };
    }
  }
  return null;
}

function detectDirection(line) {
  const match = /^(flowchart|graph)\s+(TB|TD|BT|LR|RL)\b/i.exec(line);
  if (match) return match[2].toUpperCase();
  const any = /^(flowchart|graph)\b/i.exec(line);
  return any ? "TB" : null;
}

function splitStatements(line) {
  // Semicolons separate statements; this subset has no quoted semicolons.
  return line.split(";").map((part) => part.trim()).filter(Boolean);
}

export function parseFlowchart(source) {
  const lines = String(source).replace(/\r\n?/g, "\n").split("\n");
  let direction = null;
  const nodes = new Map();
  const order = [];
  const edges = [];
  const groups = [];
  let group = null;
  let seenHeader = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (!seenHeader) {
      const dir = detectDirection(line);
      if (!dir) return { ok: false, reason: "unsupported-type" };
      direction = dir;
      seenHeader = true;
      continue;
    }
    if (UNSUPPORTED.some((re) => re.test(line))) {
      return { ok: false, reason: "unsupported-construct" };
    }
    if (/^subgraph\b/i.test(line)) {
      const titleMatch = /^subgraph\s+([A-Za-z0-9_]+)?\s*\[?"?([^"\]]*)"?\]?\s*$/.exec(line);
      group = {
        id: titleMatch && titleMatch[1] ? titleMatch[1] : `g${groups.length}`,
        title: titleMatch && titleMatch[2] ? titleMatch[2].trim() : "",
        members: [],
      };
      groups.push(group);
      continue;
    }
    if (/^end$/i.test(line)) {
      group = null;
      continue;
    }
    if (/^direction\s+/i.test(line)) continue;

    for (const statement of splitStatements(line)) {
      const edge = EDGE_RE.exec(statement);
      if (edge) {
        const from = parseNode(edge[1] + (edge[2] || ""));
        const to = parseNode(edge[5] + (edge[6] || ""));
        if (!from || !to) return { ok: false, reason: "unsupported-construct" };
        registerNode(nodes, order, from, group);
        registerNode(nodes, order, to, group);
        edges.push({
          from: from.id,
          to: to.id,
          label: (edge[4] || "").trim(),
          kind: edge[3],
        });
        continue;
      }
      const node = parseNode(statement);
      if (!node) return { ok: false, reason: "unsupported-construct" };
      registerNode(nodes, order, node, group);
    }
  }

  if (!seenHeader || order.length === 0) return { ok: false, reason: "unsupported-construct" };
  return { ok: true, direction, nodes, order, edges, groups };
}

function registerNode(nodes, order, node, group) {
  if (!nodes.has(node.id)) {
    nodes.set(node.id, { ...node, group: group ? group.id : null });
    order.push(node.id);
    if (group && !group.members.includes(node.id)) group.members.push(node.id);
    return;
  }
  const existing = nodes.get(node.id);
  if (existing.label === existing.id && node.label !== node.id) existing.label = node.label;
  if (existing.shape === "rect" && node.shape !== "rect") existing.shape = node.shape;
  if (!existing.group && group) {
    existing.group = group.id;
    if (!group.members.includes(node.id)) group.members.push(node.id);
  }
}

function rankNodes(parsed) {
  const { order, edges } = parsed;
  const rank = new Map(order.map((id) => [id, 0]));
  const outgoing = new Map(order.map((id) => [id, []]));
  const indegree = new Map(order.map((id) => [id, 0]));
  for (const edge of edges) {
    if (!outgoing.has(edge.from) || indegree.get(edge.to) === undefined) continue;
    outgoing.get(edge.from).push(edge.to);
    indegree.set(edge.to, indegree.get(edge.to) + 1);
  }
  // Kahn layering; nodes left in a cycle keep the best rank seen.
  const queue = order.filter((id) => indegree.get(id) === 0);
  const remaining = new Map(indegree);
  while (queue.length) {
    const id = queue.shift();
    for (const next of outgoing.get(id)) {
      rank.set(next, Math.max(rank.get(next), rank.get(id) + 1));
      remaining.set(next, remaining.get(next) - 1);
      if (remaining.get(next) === 0) queue.push(next);
    }
  }
  for (const edge of edges) {
    if (!rank.has(edge.from) || !rank.has(edge.to)) continue;
    if (remaining.get(edge.to) > 0) {
      rank.set(edge.to, Math.max(rank.get(edge.to), rank.get(edge.from) + 1));
    }
  }
  return rank;
}

function nodeBox(node) {
  const width = Math.max(72, textWidth(node.label) + 34);
  const height = node.shape === "diamond" ? 56 : 44;
  return { width, height };
}

function placeNodes(parsed, rank) {
  const nodes = parsed.nodes;
  const byRank = new Map();
  for (const id of parsed.order) {
    const r = rank.get(id) || 0;
    if (!byRank.has(r)) byRank.set(r, []);
    byRank.get(r).push(id);
  }
  const ranks = [...byRank.keys()].sort((a, b) => a - b);
  const horizontal = parsed.direction === "LR" || parsed.direction === "RL";

  // Measure rank extents.
  const rankSizes = new Map();
  for (const r of ranks) {
    const ids = byRank.get(r);
    const sizes = ids.map((id) => ({ id, ...nodeBox(nodes.get(id)) }));
    const main = Math.max(...sizes.map((s) => (horizontal ? s.height : s.width)));
    const cross = sizes.reduce((sum, s) => sum + (horizontal ? s.width : s.height), 0) + (sizes.length - 1) * 34;
    rankSizes.set(r, { sizes, main, cross });
  }

  const maxCross = Math.max(...[...rankSizes.values()].map((s) => s.cross));
  const positions = new Map();
  let mainCursor = 40;
  for (const r of ranks) {
    const info = rankSizes.get(r);
    let crossCursor = 40 + (maxCross - info.cross) / 2;
    for (const size of info.sizes) {
      const x = horizontal ? mainCursor + (info.main - size.width) / 2 : crossCursor;
      const y = horizontal ? crossCursor : mainCursor + (info.main - size.height) / 2;
      positions.set(size.id, { x, y, width: size.width, height: size.height });
      crossCursor += (horizontal ? size.width : size.height) + 34;
    }
    mainCursor += info.main + 70;
  }
  return { positions, width: 40 * 2 + (horizontal ? mainCursor - 70 : maxCross), height: 40 * 2 + (horizontal ? maxCross : mainCursor - 70), horizontal };
}

function groupBoxes(parsed, positions) {
  const boxes = [];
  for (const group of parsed.groups) {
    const members = group.members.map((id) => positions.get(id)).filter(Boolean);
    if (!members.length) continue;
    const minX = Math.min(...members.map((m) => m.x)) - 16;
    const minY = Math.min(...members.map((m) => m.y)) - 30;
    const maxX = Math.max(...members.map((m) => m.x + m.width)) + 16;
    const maxY = Math.max(...members.map((m) => m.y + m.height)) + 14;
    boxes.push({ id: group.id, title: group.title, x: minX, y: minY, width: maxX - minX, height: maxY - minY });
  }
  return boxes;
}

function anchorPoint(box, toward) {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const dx = toward.x - cx;
  const dy = toward.y - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const scaleX = dx === 0 ? Infinity : box.width / 2 / Math.abs(dx);
  const scaleY = dy === 0 ? Infinity : box.height / 2 / Math.abs(dy);
  const scale = Math.min(scaleX, scaleY);
  return { x: cx + dx * scale, y: cy + dy * scale };
}

function nodeSvg(node, box) {
  const label = escapeXml(node.label);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const style = 'fill="var(--card, #fff)" stroke="var(--line, #999)" stroke-width="1.4"';
  let shape;
  if (node.shape === "diamond") {
    shape = `<polygon points="${cx},${box.y} ${box.x + box.width},${cy} ${cx},${box.y + box.height} ${box.x},${cy}" ${style}/>`;
  } else if (node.shape === "circle") {
    shape = `<ellipse cx="${cx}" cy="${cy}" rx="${box.width / 2}" ry="${box.height / 2}" ${style}/>`;
  } else if (node.shape === "stadium") {
    shape = `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="${box.height / 2}" ${style}/>`;
  } else if (node.shape === "round") {
    shape = `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="10" ${style}/>`;
  } else {
    shape = `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="4" ${style}/>`;
  }
  return `${shape}<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-size="13" fill="var(--ink, #222)">${label}</text>`;
}

function edgeSvg(edge, positions) {
  const from = positions.get(edge.from);
  const to = positions.get(edge.to);
  if (!from || !to) return "";
  const fromCenter = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const toCenter = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
  const start = anchorPoint(from, toCenter);
  const end = anchorPoint(to, fromCenter);
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;
  const marker = edge.kind === "---" ? "" : "";
  const arrow =
    edge.kind === "---"
      ? ""
      : `<polygon points="${end.x},${end.y} ${end.x - 7},${end.y - 4} ${end.x - 7},${end.y + 4}" fill="var(--muted, #777)"/>`;
  const label = edge.label
    ? `<rect x="${mx - textWidth(edge.label) / 2 - 4}" y="${my - 10}" width="${textWidth(edge.label) + 8}" height="18" rx="4" fill="var(--paper, #fbf9f4)" stroke="none"/><text x="${mx}" y="${my + 4}" text-anchor="middle" font-size="11" fill="var(--muted, #777)">${escapeXml(edge.label)}</text>`
    : "";
  return `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="var(--muted, #777)" stroke-width="1.3"${marker}/>${arrow}${label}`;
}

export function renderMermaid(source) {
  const parsed = parseFlowchart(source);
  if (!parsed.ok) return null;
  const rank = rankNodes(parsed);
  const { positions, width, height } = placeNodes(parsed, rank);
  const groups = groupBoxes(parsed, positions);
  const groupSvg = groups
    .map(
      (group) =>
        `<g class="mermaid-subgraph"><rect x="${group.x}" y="${group.y}" width="${group.width}" height="${group.height}" rx="10" fill="none" stroke="var(--line, #ccc)" stroke-dasharray="5 4"/><text x="${group.x + 10}" y="${group.y + 18}" font-size="11" fill="var(--muted, #777)">${escapeXml(group.title)}</text></g>`,
    )
    .join("");
  const edges = parsed.edges.map((edge) => edgeSvg(edge, positions)).join("");
  const nodes = parsed.order
    .map((id) => nodeSvg(parsed.nodes.get(id), positions.get(id)))
    .join("");
  return `<svg class="mermaid-svg" viewBox="0 0 ${Math.ceil(width)} ${Math.ceil(height)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="flowchart">${groupSvg}${edges}${nodes}</svg>`;
}
