// Browser opening for queue views: reads the run trigger from the progress
// document and opens a page only for interactive handbacks.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { isUnderRoot } from "./core-bridge.mjs";

export function readTrigger(progressPath) {
  const content = fs.readFileSync(progressPath, "utf8");
  const match = /^\s*-\s*Trigger:\s*(interactive|scheduled)\s*$/m.exec(content);
  return match ? match[1] : null;
}

export function openInBrowser(filePath, options = {}) {
  const root = path.resolve(options.root || path.dirname(filePath));
  const absolute = path.resolve(filePath);

  if (!isUnderRoot(absolute, root)) {
    throw new Error(`refusing to open a file outside the queue root: ${absolute}`);
  }
  if (!fs.existsSync(absolute)) {
    throw new Error(`view does not exist: ${absolute}`);
  }

  const spawnFn = options.spawnFn || spawn;
  let command;
  let args;

  if (process.platform === "darwin") {
    command = "/usr/bin/open";
    args = [absolute];
  } else if (process.platform === "win32") {
    command = "cmd";
    args = ["/c", "start", "", absolute];
  } else {
    command = "xdg-open";
    args = [absolute];
  }

  const child = spawnFn(command, args, { stdio: "ignore", detached: true });
  if (child && typeof child.unref === "function") child.unref();
  return { opened: true, command, args };
}

export function maybeAutoOpen(options) {
  if (options.trigger !== "interactive") {
    return { opened: false, reason: "trigger is not interactive" };
  }
  return openInBrowser(options.filePath, options);
}
