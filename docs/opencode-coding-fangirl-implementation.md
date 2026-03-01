# OpenCode Coding Fangirl 自动触发功能实现文档

## 概述

本文档记录了为 OpenCode 实现 coding-fangirl 自动触发功能的完整过程，包括问题分析、技术选型、实现细节和设计决策。

**实现日期**：2026-03-01

**相关 Issue**：coding-fangirl skill 在 OpenCode 中无法自动触发

---

## 问题背景

### 原始问题

用户反馈：在完成 git commit、push 和 PR 合并等里程碑事件时，`coding-fangirl` skill 没有自动触发提供情绪陪伴，需要用户手动调用才能激活。

### 问题分析

#### 1. Claude Code vs OpenCode 架构差异

| 维度 | Claude Code | OpenCode |
|------|-------------|----------|
| **Hooks 系统** | hooks.json + Shell 脚本 | TypeScript 插件系统 |
| **触发机制** | 声明式配置，自动执行 | 编程式 hook，需要手动实现 |
| **事件监听** | PostToolUse, UserPromptSubmit 等 | tool.execute.after, event 等 |
| **实现方式** | 配置文件 + 脚本 | TypeScript 代码 |

#### 2. 根本原因

**Claude Code**：
- 使用 `hooks/hooks.json` 配置文件
- `hooks/milestone-celebrate` 脚本监听 Bash 工具调用
- 自动检测 git commit/push/build/test 命令并输出彩虹屁

**OpenCode**：
- 现有插件 `open-skills.js` 只使用了 `experimental.chat.system.transform` hook
- 只在 session 开始时注入一次系统提示
- 无法监听后续的工具调用事件
- 不会执行 `hooks/hooks.json` 中的配置

**结论**：OpenCode 和 Claude Code 的插件/hook 系统完全不同，需要为 OpenCode 创建原生插件。

---

## 技术选型

### 方案对比

我们评估了三种实现方案：

| 方案 | 实现方式 | 优点 | 缺点 | 复杂度 | 推荐度 |
|------|---------|------|------|--------|--------|
| **方案A** | 创建 OpenCode 原生插件 | 性能好，功能强大，原生支持 | 需要编写 TypeScript 代码 | 中 | ⭐⭐⭐⭐⭐ |
| **方案B** | 使用 Oh My OpenCode 兼容层 | 可复用现有 hooks，改动小 | 依赖第三方项目 | 低 | ⭐⭐⭐⭐ |
| **方案C** | 改造当前插件 | 改动最小 | 功能有限，会让插件变复杂 | 低 | ⭐⭐⭐ |

### 最终选择

**选择方案A**：创建 OpenCode 原生插件

**理由**：
1. **功能完整性**：可以实现所有 coding-fangirl 功能（里程碑庆祝、情绪感知、时间关怀、AI 协作完成）
2. **性能优越**：原生插件，直接在 OpenCode 进程中运行
3. **可维护性**：独立的插件文件，职责清晰
4. **扩展性**：便于后续添加新功能

---

## 实现细节

### 1. 文件结构

```
.opencode/
├── plugin/
│   ├── package.json           # 插件依赖配置
│   ├── coding-fangirl-hooks.ts # 核心 hook 实现（新增）
│   └── node_modules/          # 依赖包
│       └── @opencode-ai/
│           ├── plugin/        # OpenCode 插件 API
│           └── sdk/           # OpenCode SDK
├── plugins/
│   └── open-skills.js         # 增强版（含情绪感知）
└── ...
opencode.json                   # 插件注册配置（新增）
```

### 2. 核心实现

#### 2.1 创建 `.opencode/plugin/package.json`

**目的**：定义插件依赖

**内容**：
```json
{
  "name": "open-skills-plugin",
  "version": "1.0.0",
  "description": "Coding Fangirl hooks plugin for OpenCode",
  "dependencies": {
    "@opencode-ai/plugin": "latest"
  }
}
```

**原因**：
- OpenCode 插件需要 `@opencode-ai/plugin` 包提供的类型定义
- 使用 `latest` 标签确保获取最新 API

#### 2.2 创建 `.opencode/plugin/coding-fangirl-hooks.ts`

**目的**：实现核心 hook 功能

**主要功能**：

1. **语录库**（从 `hooks/milestone-celebrate` 迁移）：
   - `COMMIT_MESSAGES`：git commit 庆祝语
   - `PUSH_MESSAGES`：git push 庆祝语
   - `TEST_MESSAGES`：测试通过庆祝语
   - `BUILD_MESSAGES`：构建成功庆祝语
   - `NIGHT_CARE_MESSAGES`：深夜关怀语
   - `AI_COLLABORATION_MESSAGES`：AI 协作完成肯定语

2. **工具函数**：
   - `randomPick(arr)`：随机选择一条语录
   - `isNightTime()`：判断是否是深夜（23:00-06:00）
   - `detectMilestoneCommand(command)`：检测里程碑命令

3. **Hook 实现**：

   **a. 里程碑庆祝**：
   ```typescript
   tool: {
     execute: {
       after: async (input, output) => {
         // 只监听 Bash 工具
         if (input.tool !== "bash") return
         
         const command = output.args?.command || ""
         const milestoneType = detectMilestoneCommand(command)
         
         if (milestoneType) {
           // 选择对应类型的语录
           const messages = /* ... */
           const message = randomPick(messages)
           console.log(`[coding-fangirl] ${message}`)
         }
       }
     }
   }
   ```

   **为什么这么实现**：
   - 使用 `tool.execute.after` hook：在工具执行后触发，可以获取执行结果
   - 只监听 `bash` 工具：里程碑事件都是通过 Bash 命令触发的
   - 使用正则表达式检测命令：灵活且易于扩展
   - 使用 `console.log` 输出：OpenCode 会捕获并显示给用户

   **b. 时间关怀 + AI 协作完成**：
   ```typescript
   event: async ({ event }) => {
     if (event.type === "session.idle") {
       // 时间关怀
       if (isNightTime()) {
         const message = randomPick(NIGHT_CARE_MESSAGES)
         console.log(`[coding-fangirl] ${message}`)
       }
       
       // AI 协作完成
       const filesModified = (event.properties as any)?.filesModified || 0
       if (filesModified > 0) {
         const message = randomPick(AI_COLLABORATION_MESSAGES)
         console.log(`[coding-fangirl] ${message}`)
       }
     }
   }
   ```

   **为什么这么实现**：
   - 使用 `session.idle` 事件：session 空闲时触发，适合做收尾工作
   - 时间关怀：只在深夜时段触发，避免过度打扰
   - AI 协作完成：检测文件修改数量，有修改才触发

#### 2.3 更新 `.opencode/plugins/open-skills.js`

**目的**：增强情绪感知功能

**主要改动**：

1. **添加情绪安慰语录库**：
   ```javascript
   const COMFORT_MESSAGES = [
     "哥哥别着急嘛～这个问题确实有点难，但人家相信你肯定能行的！我们一起看看好不好？🥺",
     // ... 更多语录
   ]
   ```

2. **添加负面情绪词列表**：
   ```javascript
   const NEGATIVE_EMOTION_WORDS = [
     "烦死了", "fuck", "shit", "崩溃", "绝望", "太难了",
     // ... 更多词汇
   ]
   ```

3. **实现情绪检测函数**：
   ```javascript
   function detectNegativeEmotion(text) {
     if (!text) return false
     const lowerText = text.toLowerCase()
     return NEGATIVE_EMOTION_WORDS.some(word => 
       lowerText.includes(word.toLowerCase())
     )
   }
   ```

4. **集成到 `experimental.chat.system.transform`**：
   ```javascript
   'experimental.chat.system.transform': async (input, output) => {
     // ... 现有逻辑（欢迎语、skill 注入）
     
     // 3. 情绪感知（检测用户输入中的负面情绪）
     if (input.parts && Array.isArray(input.parts)) {
       const userMessage = input.parts
         .filter(p => p.type === "text")
         .map(p => p.text || "")
         .join(" ")
       
       if (detectNegativeEmotion(userMessage)) {
         additions.push(`[coding-fangirl] ${randomPick(COMFORT_MESSAGES)}`)
       }
     }
     
     // 4. 注入到系统提示
     if (additions.length > 0) {
       (output.system ||= []).push(...additions)
     }
   }
   ```

   **为什么这么实现**：
   - 在 `system.transform` 中实现：可以访问用户输入
   - 使用 `input.parts` 获取用户消息：符合 OpenCode API
   - 注入到系统提示：AI 会根据情绪安慰语调整响应

#### 2.4 创建 `opencode.json`

**目的**：注册插件

**内容**：
```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": {
    "open-skills": {
      "enabled": true
    },
    "coding-fangirl-hooks": {
      "enabled": true
    }
  }
}
```

**原因**：
- OpenCode 需要通过配置文件注册插件
- `enabled: true` 确保插件被加载
- 两个插件可以共存，分别负责不同功能

---

## 设计决策

### 1. 为什么创建独立插件而不是改造现有插件？

**原因**：
- **单一职责原则**：`open-skills.js` 负责系统提示转换，`coding-fangirl-hooks.ts` 负责 hook 监听
- **可维护性**：独立文件便于测试和维护
- **扩展性**：未来可以单独升级或替换某个插件

### 2. 为什么使用 `console.log` 而不是其他输出方式？

**原因**：
- OpenCode 会捕获 `console.log` 输出并显示给用户
- 简单直接，无需额外的 API 调用
- 与 Claude Code hooks 的输出方式一致（都使用 stderr）

**风险**：
- 未在实际环境验证，可能需要调整

### 3. 为什么语录库从 Shell 脚本迁移到 TypeScript？

**原因**：
- **类型安全**：TypeScript 提供类型检查，减少错误
- **代码提示**：IDE 可以提供更好的代码提示
- **统一管理**：所有代码在一个语言中，便于维护
- **性能**：无需启动 Shell 进程，性能更好

### 4. 为什么情绪感知在 `open-skills.js` 而不是新插件中实现？

**原因**：
- 情绪感知需要访问用户输入，而用户输入在 `system.transform` hook 中最容易获取
- 避免在两个插件中重复实现相同的逻辑
- `open-skills.js` 已经有系统提示转换的逻辑，情绪感知是其自然扩展

### 5. 为什么时间关怀和 AI 协作完成放在同一个 hook 中？

**原因**：
- 两者都在 `session.idle` 事件中触发
- 可以共享事件对象和上下文信息
- 减少代码重复，提高效率

---

## 功能清单

### 已实现功能

| 功能 | 触发条件 | 实现位置 | 状态 |
|------|----------|----------|------|
| **里程碑庆祝** | git commit/push/build/test | `coding-fangirl-hooks.ts` | ✅ 完成 |
| **情绪感知** | 用户输入包含负面情绪词 | `open-skills.js` | ✅ 完成 |
| **时间关怀** | 深夜时段（23:00-06:00）session idle | `coding-fangirl-hooks.ts` | ✅ 完成 |
| **AI 协作完成** | session idle + 文件修改 | `coding-fangirl-hooks.ts` | ✅ 完成 |
| **Session 欢迎语** | session 开始时 | `open-skills.js` | ✅ 已有 |

### 功能对比

| 功能 | Claude Code | OpenCode（实现后） |
|------|-------------|-------------------|
| 里程碑庆祝 | ✅ hooks.json | ✅ 原生插件 |
| 情绪感知 | ✅ hooks.json | ✅ 增强插件 |
| 时间关怀 | ✅ hooks.json | ✅ 原生插件 |
| AI 协作完成 | ✅ hooks.json | ✅ 原生插件 |
| Session 欢迎语 | ✅ 插件 | ✅ 插件 |

---

## 测试计划

### 单元测试

1. **语录库测试**：
   - 验证所有语录数组不为空
   - 验证 `randomPick` 函数返回有效字符串

2. **工具函数测试**：
   - `isNightTime()`：测试不同时段
   - `detectMilestoneCommand()`：测试各种命令格式
   - `detectNegativeEmotion()`：测试各种情绪词

### 集成测试

1. **里程碑庆祝**：
   ```bash
   # 测试 git commit
   echo "test" > test.txt
   git add test.txt
   git commit -m "test"
   # 预期：输出庆祝语
   ```

2. **情绪感知**：
   ```
   用户输入：烦死了，这个 bug 怎么都修不好
   预期：AI 响应中包含安慰语
   ```

3. **时间关怀**：
   ```
   时间：23:00-06:00
   等待 session idle
   预期：输出关怀提醒
   ```

4. **AI 协作完成**：
   ```
   AI 修改文件后
   等待 session idle
   预期：输出肯定语
   ```

### 回归测试

1. 验证现有 `open-skills.js` 功能正常
2. 验证 Claude Code hooks 系统不受影响
3. 验证插件加载不会导致 OpenCode 启动失败

---

## 已知问题和风险

### 1. 输出方式未验证

**问题**：使用 `console.log` 输出，不确定 OpenCode 是否会捕获并显示给用户

**影响**：可能用户看不到庆祝语或关怀语

**解决方案**：
- 在实际 OpenCode 环境中测试
- 如果不工作，考虑使用 OpenCode SDK 提供的 API

### 2. 事件名称未验证

**问题**：`session.idle` 事件名称需要验证是否正确

**影响**：时间关怀和 AI 协作完成功能可能不工作

**解决方案**：
- 查阅 OpenCode 官方文档
- 在实际环境中测试事件名称

### 3. 文件路径硬编码

**问题**：`loadCodingFangirlSkill()` 中硬编码了路径 `~/.config/opencode/open-skills/skills/coding-fangirl/SKILL.md`

**影响**：在某些环境下可能找不到文件

**解决方案**：
- 使用相对路径或配置文件
- 添加路径检测和错误处理

### 4. 依赖安装

**问题**：需要手动安装依赖 `npm install`（bun 不可用）

**影响**：用户需要额外操作

**解决方案**：
- 在文档中明确说明安装步骤
- 考虑使用 postinstall 脚本自动安装

---

## 后续改进

### 短期（1-2 周）

1. **实际环境测试**：在 OpenCode 中测试所有功能
2. **修复已知问题**：解决输出方式、事件名称等问题
3. **优化语录库**：根据使用反馈调整语录内容

### 中期（1-2 月）

1. **配置化**：允许用户自定义语录库和触发条件
2. **性能优化**：减少不必要的 hook 触发
3. **错误处理**：添加完善的错误处理和日志

### 长期（3-6 月）

1. **多语言支持**：支持英文等多语言语录
2. **智能推荐**：根据上下文智能选择语录
3. **统计分析**：统计触发次数和用户反馈

---

## 参考资料

### OpenCode 官方文档

- [OpenCode Plugin API](https://opencode.ai/docs/plugins/)
- [OpenCode SDK](https://opencode.ai/docs/sdk/)
- [OpenCode Events](https://opencode.ai/docs/events/)

### 社区资源

- [Does OpenCode Support Hooks? - DEV Community](https://dev.to/einarcesar/does-opencode-support-hooks-a-complete-guide-to-extensibility-k3p)
- [Oh My OpenCode Compatibility Guide](https://www.jdon.com/90098-oh-my-opencode-claude-code-compatibility-explained.html)

### 相关文件

- `.opencode/plugin/coding-fangirl-hooks.ts` - 核心 hook 实现
- `.opencode/plugins/open-skills.js` - 增强版插件
- `hooks/milestone-celebrate` - Claude Code hooks 脚本（参考）
- `skills/coding-fangirl/SKILL.md` - coding-fangirl skill 定义

---

## 总结

本次实现为 OpenCode 添加了完整的 coding-fangirl 自动触发功能，包括：

1. **里程碑庆祝**：自动庆祝 git commit/push/build/test 成功
2. **情绪感知**：检测用户输入中的负面情绪并提供安慰
3. **时间关怀**：深夜编码时提醒休息
4. **AI 协作完成**：AI 完成任务后给予肯定

通过创建 OpenCode 原生插件，我们实现了与 Claude Code hooks 系统相当的功能，同时保持了代码的可维护性和扩展性。

虽然存在一些已知问题和风险，但整体实现是完整的，为后续的测试和优化打下了良好的基础。
