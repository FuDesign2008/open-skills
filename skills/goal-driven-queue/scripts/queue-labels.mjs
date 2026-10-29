// Queue-specific chrome copy (kickers, subtitles, section labels) and the
// shared shell-option assembly used by every queue page renderer.
import { baseLabels } from "./core-bridge.mjs";

export function kindLabel(kind, labels = {}) {
  const kinds = labels.kinds || {};
  return (
    kinds[kind] ||
    {
      card: "任务卡",
      triage: "Triage 记录",
      progress: "进度文档",
      verification: "人工核对",
      report: "完成报告",
      document: "队列文档",
    }[kind] ||
    "队列文档"
  );
}

export function chromeLabels(options = {}) {
  const base = baseLabels(options);
  const lang = String(options.lang || "zh").toLowerCase();
  const english = lang.startsWith("en");
  const defaults = english
    ? {
        toc: "On this page",
        entryKicker: "Acceptance entry",
        entrySubtitle:
          "Open any page to browse this run; missing targets are marked unavailable.",
        evidenceKicker: "Evidence record",
        evidenceTitle: "Evidence record",
        evidenceEmpty: "No checks were recorded.",
        reviewKicker: "Change note",
        reviewTitle: "Change note",
        problem: "Problem",
        cause: "Cause",
        fix: "Completed fix",
        pending: "pending",
        source: "Source",
        generated: "Generated",
        kinds: {
          card: "Task card",
          triage: "Triage record",
          progress: "Progress",
          verification: "Human verification",
          report: "Completion report",
          document: "Queue document",
        },
      }
    : {
        toc: "本页目录",
        entryKicker: "验收入口",
        entrySubtitle: "打开任意页面即可横向查看本次运行的记录；缺失目标标注为不可用。",
        evidenceKicker: "证据留痕",
        evidenceTitle: "证据留痕",
        evidenceEmpty: "未记录任何检查，且不含图片。",
        reviewKicker: "变更说明",
        reviewTitle: "变更说明",
        problem: "问题",
        cause: "原因",
        fix: "已完成的修复",
        pending: "待补",
        source: "来源",
        generated: "生成",
        kinds: {
          card: "任务卡",
          triage: "Triage 记录",
          progress: "进度文档",
          verification: "人工核对",
          report: "完成报告",
          document: "队列文档",
        },
      };
  return { ...defaults, ...base, kinds: { ...defaults.kinds, ...((options.labels || {}).kinds || {}) } };
}

export function shellOptionsFor(options = {}) {
  const chrome = chromeLabels(options);
  return {
    chrome,
    shellOptions: {
      ...options,
      sourceLabelText: options.sourceLabelText || chrome.source,
      generatedLabelText: options.generatedLabelText || chrome.generated,
    },
  };
}
