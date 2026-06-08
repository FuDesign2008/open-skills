---
name: typescript-check
version: "1.0.0"
user-invocable: true
description: TypeScript 类型检查流程。当用户说"类型检查"、"type-check"、"tsc"或需要检查 TypeScript 类型错误时触发。
---

# TypeScript 类型检查流程

## 触发词

- "类型检查"
- "type-check"
- "tsc"
- "检查类型"

## 检查流程

### 步骤1：智能检测命令

按优先级尝试以下命令：
```bash
# 优先使用项目配置的脚本
if grep -q '"type-check"' package.json; then
    npm run type-check
elif grep -q '"check"' package.json; then
    npm run check
elif [ -f "tsconfig.json" ]; then
    npx tsc --noEmit
else
    echo "⚠️ 未找到 TypeScript 配置"
fi
```

### 步骤2：汇报结果

**如果检查通过：**
```
✅ TypeScript 类型检查通过
```

**如果检查失败：**
```
❌ 发现 TypeScript 类型错误：

文件:xxx.ts:行号:列号 - 错误描述
文件:yyy.tsx:行号:列号 - 错误描述

共发现 N 个错误
```

### 步骤3：主动修复方案

对于每个错误，按以下格式提供修复方案：

```
### 错误 N: [简要描述]

📍 位置: 文件:行号

🔧 修复方案:
[说明修复思路]

是否应用此修复？(等待用户同意)
```

**重要**：必须等待用户明确同意后才能执行修复。

### 步骤4：批量修复

如果用户同意，可以逐个或批量修复，每修复一个后重新检查，直到所有错误解决。
