---
name: android-webview-debug
description: Android 工程内统一 WebView 远程调试开关。android-webview-debug-enable 将 setWebContentsDebuggingEnabled 全部设为 true 并记录修改位置与修改前内容；android-webview-debug-revert 按记录恢复，与记录不符的项在最后列出并等待人工确认。适用于需要统一开启或恢复 WebView 调试的 Android 项目。
---

# Android WebView 调试统一

## 触发词

- **android-webview-debug-enable**：将工程内所有 `setWebContentsDebuggingEnabled` 改为 `true`，并**记录**修改位置与修改前内容，供后续 revert 使用。
- **android-webview-debug-revert**：根据记录**恢复**之前被 enable 改过的位置；与记录不符的项**不自动恢复**，在最后列出并提示，由用户确认是否恢复或跳过。

## 状态文件约定

- **路径**：当前工程/工作区**根目录**下的 `.android-webview-debug-state.json`。
- **生成时机**：仅在执行 **android-webview-debug-enable** 时创建或覆盖；revert 只读不写（恢复完成后可删除或归档）。
- **格式**：

```json
{
  "version": 1,
  "createdAt": "ISO8601",
  "projectRoot": "/absolute/path/to/project",
  "entries": [
    {
      "file": "app/src/main/java/.../CoreWebView.kt",
      "line": 42,
      "original": "setWebContentsDebuggingEnabled(AppContext.isDebug())",
      "replaced": "setWebContentsDebuggingEnabled(true)"
    }
  ]
}
```

- **说明**：只记录**本轮 enable 实际改动的项**（原本已是 `true` 的不写入 entries）。建议将 `.android-webview-debug-state.json` 加入 `.gitignore`，避免误提交。

---

## android-webview-debug-enable 流程

1. **搜索**：用 grep 或 codebase 搜索 `setWebContentsDebuggingEnabled`（含注释行），列出所有出现位置。
2. **分类**：对每个位置标记为「已是 true」「条件或其它表达式」「被注释」。
3. **可选确认**：若需用户决策，可用 1～2 个选择题（例如：是否全部改为 true？被注释的是否也改？），用户可简答 1A 2B。
4. **已有记录**：若工程根目录已存在 `.android-webview-debug-state.json`，先提示「已有 enable 记录，是否覆盖并继续？」待用户确认后再覆盖。
5. **写状态文件**：在**执行任何代码替换之前**，根据即将被改动的项生成 `entries`，写入 `.android-webview-debug-state.json`（路径为工程根目录）。
6. **执行替换**：将「条件或其它表达式」的调用改为 `setWebContentsDebuggingEnabled(true)`；**默认不修改被注释的调用**，除非用户明确说「连注释的也改」或「取消注释」。
7. **收尾**：简要列出已修改文件与条目数。

---

## android-webview-debug-revert 流程

1. **读取状态文件**：从当前工程根目录读取 `.android-webview-debug-state.json`。若不存在则提示「未找到 enable 记录，无法执行 revert」并结束。
2. **遍历 entries**：
   - 对每条：读取对应文件的对应行，与 `replaced` 比较（或判断是否包含 `setWebContentsDebuggingEnabled(true)`）。
   - **一致**：将该行替换为 `original`（恢复为修改前内容）。
   - **不一致**：不自动恢复，将该条加入「与记录不符」列表（记录 file、line、当前行摘要）。
3. **先完成所有可恢复项**：只对「当前行与记录一致」的项执行替换。
4. **最后提示与人工确认**：若有「与记录不符」的项，在最后统一输出列表并说明：「以下 N 处与 enable 时的记录不符（可能已被人工修改），请确认是否仍要按记录恢复或跳过。」根据用户选择逐条恢复或跳过。
5. **收尾**：说明已恢复条目数；若全部恢复完毕，可提示「可将 .android-webview-debug-state.json 删除或加入 .gitignore」。

---

## 默认规则

- **enable**：默认**不修改**被注释的 `setWebContentsDebuggingEnabled` 调用；用户可一句话覆盖（如「注释的也改」）。
- **revert**：只恢复状态文件中记录的条目；与记录不符的**不自动恢复**，一律放到最后提示并等待人工确认。
- **状态文件**：仅项目根目录一份；enable 覆盖写入，revert 只读。

---

## 验证要点

- enable 后：工程内所有非注释的 `setWebContentsDebuggingEnabled` 应为 `true`，且根目录存在 `.android-webview-debug-state.json` 且 `entries` 与本次修改一一对应。
- revert 后：被恢复的行内容与状态文件中 `original` 一致；与记录不符的项已列出并经用户确认处理。
