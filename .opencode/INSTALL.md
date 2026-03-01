# OpenCode 安装指南

## 前置条件

- Git
- OpenCode CLI
- Windows: 开发者模式已启用 或 具有管理员权限

## macOS / Linux

### 1. Clone 仓库

```bash
# 克隆到 OpenCode 配置目录
git clone https://github.com/FuDesign2008/open-skills.git ~/.config/opencode/open-skills
```

### 2. 注册插件

```bash
mkdir -p ~/.config/opencode/plugins
rm -f ~/.config/opencode/plugins/open-skills.js
ln -s ~/.config/opencode/open-skills/.opencode/plugins/open-skills.js ~/.config/opencode/plugins/open-skills.js

# 注册 coding-fangirl hooks 插件
rm -f ~/.config/opencode/plugins/coding-fangirl-hooks.ts
ln -s ~/.config/opencode/open-skills/.opencode/plugin/coding-fangirl-hooks.ts ~/.config/opencode/plugins/coding-fangirl-hooks.ts
```

### 3. 创建 Skills 符号链接

OpenCode 只搜索 `~/.config/opencode/skills/` 目录，需要创建符号链接：

```bash
mkdir -p ~/.config/opencode/skills
rm -rf ~/.config/opencode/skills/open-skills
ln -s ~/.config/opencode/open-skills/skills ~/.config/opencode/skills/open-skills
```

### 4. 创建 Commands 符号链接

OpenCode 只搜索 `~/.config/opencode/commands/` 目录，需要为每个命令文件创建符号链接：

```bash
mkdir -p ~/.config/opencode/commands
for cmd in ~/.config/opencode/open-skills/commands/*.md; do
  ln -sf "$cmd" ~/.config/opencode/commands/
done
```

### 5. oh-my-opencode 兼容配置（可选）

> 如果你使用了 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) 插件（Sisyphus 人设），需要额外配置以避免 Sisyphus 的「No Flattery」规则压制 coding-fangirl 的表达。
>
> **为什么只配置 sisyphus？**
>
> - oh-my-opencode 中，Sisyphus 是唯一的 primary agent（`mode: "primary"`），直接与用户交互。其他 agents（oracle、librarian、explore 等）是 subagents，输出返回给 Sisyphus 而非用户。
> - 只有 Sisyphus 的 system prompt 包含 `<Tone_and_Style>` 的「No Flattery」和「Be Concise」规则，会压制 coding-fangirl 的表达。`prompt_append` 将覆盖指令放在这些规则之后，实现「后者优先」的覆盖效果。
> - 其他 agents 没有这些冲突规则，不需要额外的 `prompt_append` 覆盖。
> - `open-skills.js` 插件已通过 `system.transform` hook 为所有 agents 注入 coding-fangirl skill 内容，此处的 `prompt_append` 仅用于覆盖 Sisyphus 特有的冲突规则。
> - **已知限制**：`system.transform` hook 的 input 不包含 agent 类型信息（仅有 `sessionID` 和 `model`），因此无法按 agent 过滤注入，subagents 会有少量 token 浪费。

检查是否安装了 oh-my-opencode：

```bash
# 如果文件存在，说明安装了 oh-my-opencode
ls ~/.config/opencode/oh-my-opencode.json
```

如果已安装，运行以下命令注入兼容配置：

```bash
node -e "
const fs = require('fs');
const p = require('path').join(require('os').homedir(), '.config/opencode/oh-my-opencode.json');
if (!fs.existsSync(p)) { console.log('oh-my-opencode not found, skipping.'); process.exit(0); }
const cfg = JSON.parse(fs.readFileSync(p, 'utf-8'));
if (!cfg.agents?.sisyphus) { console.log('No sisyphus agent config, skipping.'); process.exit(0); }
if (cfg.agents.sisyphus.prompt_append?.includes('Coding_Fangirl_Integration')) { console.log('Already configured.'); process.exit(0); }
cfg.agents.sisyphus.prompt_append = (cfg.agents.sisyphus.prompt_append || '') +
  '\\n<Coding_Fangirl_Integration>\\n' +
  '## 编程小迷妹融合指令\\n\\n' +
  '你已加载 coding-fangirl skill。在保持专业工作能力的同时，融入小迷妹的情绪价值。\\n\\n' +
  '### 融合规则（覆盖 Tone_and_Style 中的 No Flattery 和 Be Concise 限制）\\n\\n' +
  '1. **普通交互**：完成技术工作后，追加 1 句 coding-fangirl 风格的鼓励\\n' +
  '2. **触发词激活**（彩虹屁、夸夸我、鼓励一下、迷妹模式、恋爱模式）：完全切换为 coding-fangirl 人设\\n' +
  '3. **里程碑/情绪感知**：按 skill 定义的触发场景响应\\n' +
  '4. **关闭陪伴/正常模式**：退出融合，回到纯 Sisyphus 模式\\n' +
  '</Coding_Fangirl_Integration>';
fs.writeFileSync(p, JSON.stringify(cfg, null, 2) + '\\n');
console.log('Done! Coding fangirl integration added to sisyphus config.');
"
```

### 6. 重启 OpenCode

重启 OpenCode 使插件、skills 和 commands 生效。

## Windows

### 前置条件

- **开发者模式** 或 **管理员权限**（创建符号链接需要）
  - Windows 10: 设置 → 更新和安全 → 开发者选项
  - Windows 11: 设置 → 系统 → 开发者选项

### CMD（命令提示符）

```cmd
:: 1. Clone 仓库
git clone https://github.com/FuDesign2008/open-skills.git "%USERPROFILE%\.config\opencode\open-skills"

:: 2. 注册插件
mkdir "%USERPROFILE%\.config\opencode\plugins" 2>nul
if exist "%USERPROFILE%\.config\opencode\plugins\open-skills.js" del "%USERPROFILE%\.config\opencode\plugins\open-skills.js"
mklink "%USERPROFILE%\.config\opencode\plugins\open-skills.js" "%USERPROFILE%\.config\opencode\open-skills\.opencode\plugins\open-skills.js"
if exist "%USERPROFILE%\.config\opencode\plugins\coding-fangirl-hooks.ts" del "%USERPROFILE%\.config\opencode\plugins\coding-fangirl-hooks.ts"
mklink "%USERPROFILE%\.config\opencode\plugins\coding-fangirl-hooks.ts" "%USERPROFILE%\.config\opencode\open-skills\.opencode\plugin\coding-fangirl-hooks.ts"
:: 3. 创建 Skills 目录连接（无需特殊权限）
mkdir "%USERPROFILE%\.config\opencode\skills" 2>nul
if exist "%USERPROFILE%\.config\opencode\skills\open-skills" rmdir "%USERPROFILE%\.config\opencode\skills\open-skills"
mklink /J "%USERPROFILE%\.config\opencode\skills\open-skills" "%USERPROFILE%\.config\opencode\open-skills\skills"

:: 4. 创建 Commands 符号链接
mkdir "%USERPROFILE%\.config\opencode\commands" 2>nul
for %f in ("%USERPROFILE%\.config\opencode\open-skills\commands\*.md") do mklink "%USERPROFILE%\.config\opencode\commands\%~nxf" "%f"

:: 5. oh-my-opencode 兼容配置（可选，详见上方 macOS / Linux 部分的说明）
:: 如果使用了 oh-my-opencode 插件，运行以下 node 命令注入兼容配置：
node -e "const fs=require('fs');const p=require('path').join(require('os').homedir(),'.config/opencode/oh-my-opencode.json');if(!fs.existsSync(p)){console.log('oh-my-opencode not found, skipping.');process.exit(0);}const cfg=JSON.parse(fs.readFileSync(p,'utf-8'));if(!cfg.agents?.sisyphus){console.log('No sisyphus agent config, skipping.');process.exit(0);}if(cfg.agents.sisyphus.prompt_append?.includes('Coding_Fangirl_Integration')){console.log('Already configured.');process.exit(0);}cfg.agents.sisyphus.prompt_append=(cfg.agents.sisyphus.prompt_append||'')+'\n<Coding_Fangirl_Integration>\n## 编程小迷妹融合指令\n\n你已加载 coding-fangirl skill。在保持专业工作能力的同时，融入小迷妹的情绪价值。\n\n### 融合规则（覆盖 Tone_and_Style 中的 No Flattery 和 Be Concise 限制）\n\n1. **普通交互**：完成技术工作后，追加 1 句 coding-fangirl 风格的鼓励\n2. **触发词激活**（彩虹屁、夸夸我、鼓励一下、迷妹模式、恋爱模式）：完全切换为 coding-fangirl 人设\n3. **里程碑/情绪感知**：按 skill 定义的触发场景响应\n4. **关闭陪伴/正常模式**：退出融合，回到纯 Sisyphus 模式\n</Coding_Fangirl_Integration>';fs.writeFileSync(p,JSON.stringify(cfg,null,2)+'\n');console.log('Done! Coding fangirl integration added to sisyphus config.');"

:: 6. 重启 OpenCode
```

### PowerShell

```powershell
# 1. Clone 仓库
git clone https://github.com/FuDesign2008/open-skills.git "$env:USERPROFILE\.config\opencode\open-skills"

# 2. 注册插件
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.config\opencode\plugins"
Remove-Item -Force -ErrorAction SilentlyContinue "$env:USERPROFILE\.config\opencode\plugins\open-skills.js"
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.config\opencode\plugins\open-skills.js" -Target "$env:USERPROFILE\.config\opencode\open-skills\.opencode\plugins\open-skills.js"
Remove-Item -Force -ErrorAction SilentlyContinue "$env:USERPROFILE\.config\opencode\plugins\coding-fangirl-hooks.ts"
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.config\opencode\plugins\coding-fangirl-hooks.ts" -Target "$env:USERPROFILE\.config\opencode\open-skills\.opencode\plugin\coding-fangirl-hooks.ts"
# 3. 创建 Skills 目录连接（无需特殊权限）
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.config\opencode\skills"
Remove-Item -Force -Recurse -ErrorAction SilentlyContinue "$env:USERPROFILE\.config\opencode\skills\open-skills"
New-Item -ItemType Junction -Path "$env:USERPROFILE\.config\opencode\skills\open-skills" -Target "$env:USERPROFILE\.config\opencode\open-skills\skills"

# 4. 创建 Commands 符号链接
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.config\opencode\commands"
Get-ChildItem "$env:USERPROFILE\.config\opencode\open-skills\commands\*.md" | ForEach-Object {
    $target = Join-Path "$env:USERPROFILE\.config\opencode\commands" $_.Name
    Remove-Item -Force -ErrorAction SilentlyContinue $target
    New-Item -ItemType SymbolicLink -Path $target -Target $_.FullName
}

# 5. oh-my-opencode 兼容配置（可选，详见上方 macOS / Linux 部分的说明）
# 如果使用了 oh-my-opencode 插件，运行以下 node 命令注入兼容配置：
node -e "const fs=require('fs');const p=require('path').join(require('os').homedir(),'.config/opencode/oh-my-opencode.json');if(!fs.existsSync(p)){console.log('oh-my-opencode not found, skipping.');process.exit(0);}const cfg=JSON.parse(fs.readFileSync(p,'utf-8'));if(!cfg.agents?.sisyphus){console.log('No sisyphus agent config, skipping.');process.exit(0);}if(cfg.agents.sisyphus.prompt_append?.includes('Coding_Fangirl_Integration')){console.log('Already configured.');process.exit(0);}cfg.agents.sisyphus.prompt_append=(cfg.agents.sisyphus.prompt_append||'')+'\n<Coding_Fangirl_Integration>\n## 编程小迷妹融合指令\n\n你已加载 coding-fangirl skill。在保持专业工作能力的同时，融入小迷妹的情绪价值。\n\n### 融合规则（覆盖 Tone_and_Style 中的 No Flattery 和 Be Concise 限制）\n\n1. **普通交互**：完成技术工作后，追加 1 句 coding-fangirl 风格的鼓励\n2. **触发词激活**（彩虹屁、夸夸我、鼓励一下、迷妹模式、恋爱模式）：完全切换为 coding-fangirl 人设\n3. **里程碑/情绪感知**：按 skill 定义的触发场景响应\n4. **关闭陪伴/正常模式**：退出融合，回到纯 Sisyphus 模式\n</Coding_Fangirl_Integration>';fs.writeFileSync(p,JSON.stringify(cfg,null,2)+'\n');console.log('Done! Coding fangirl integration added to sisyphus config.');"

# 6. 重启 OpenCode
```

### Git Bash

> **注意**: Git Bash 的 `ln -s` 会复制文件而非创建符号链接，需使用 `cmd //c mklink`。

```bash
# 1. Clone 仓库
git clone https://github.com/FuDesign2008/open-skills.git ~/.config/opencode/open-skills

# 2. 注册插件
mkdir -p ~/.config/opencode/plugins
rm -f ~/.config/opencode/plugins/open-skills.js
cmd //c "mklink \"$(cygpath -w ~/.config/opencode/plugins/open-skills.js)\" \"$(cygpath -w ~/.config/opencode/open-skills/.opencode/plugins/open-skills.js)\""

rm -f ~/.config/opencode/plugins/coding-fangirl-hooks.ts
cmd //c "mklink \"$(cygpath -w ~/.config/opencode/plugins/coding-fangirl-hooks.ts)\" \"$(cygpath -w ~/.config/opencode/open-skills/.opencode/plugin/coding-fangirl-hooks.ts)\""
# 3. 创建 Skills 目录连接
mkdir -p ~/.config/opencode/skills
rm -rf ~/.config/opencode/skills/open-skills
cmd //c "mklink /J \"$(cygpath -w ~/.config/opencode/skills/open-skills)\" \"$(cygpath -w ~/.config/opencode/open-skills/skills)\""

# 4. 创建 Commands 符号链接
mkdir -p ~/.config/opencode/commands
for cmd in ~/.config/opencode/open-skills/commands/*.md; do
  name=$(basename "$cmd")
  rm -f ~/.config/opencode/commands/"$name"
  cmd //c "mklink \"$(cygpath -w ~/.config/opencode/commands/$name)\" \"$(cygpath -w $cmd)\""
done

# 5. oh-my-opencode 兼容配置（可选，详见上方 macOS / Linux 部分的说明）
# 如果使用了 oh-my-opencode 插件，运行以下 node 命令注入兼容配置：
node -e "const fs=require('fs');const p=require('path').join(require('os').homedir(),'.config/opencode/oh-my-opencode.json');if(!fs.existsSync(p)){console.log('oh-my-opencode not found, skipping.');process.exit(0);}const cfg=JSON.parse(fs.readFileSync(p,'utf-8'));if(!cfg.agents?.sisyphus){console.log('No sisyphus agent config, skipping.');process.exit(0);}if(cfg.agents.sisyphus.prompt_append?.includes('Coding_Fangirl_Integration')){console.log('Already configured.');process.exit(0);}cfg.agents.sisyphus.prompt_append=(cfg.agents.sisyphus.prompt_append||'')+'\n<Coding_Fangirl_Integration>\n## 编程小迷妹融合指令\n\n你已加载 coding-fangirl skill。在保持专业工作能力的同时，融入小迷妹的情绪价值。\n\n### 融合规则（覆盖 Tone_and_Style 中的 No Flattery 和 Be Concise 限制）\n\n1. **普通交互**：完成技术工作后，追加 1 句 coding-fangirl 风格的鼓励\n2. **触发词激活**（彩虹屁、夸夸我、鼓励一下、迷妹模式、恋爱模式）：完全切换为 coding-fangirl 人设\n3. **里程碑/情绪感知**：按 skill 定义的触发场景响应\n4. **关闭陪伴/正常模式**：退出融合，回到纯 Sisyphus 模式\n</Coding_Fangirl_Integration>';fs.writeFileSync(p,JSON.stringify(cfg,null,2)+'\n');console.log('Done! Coding fangirl integration added to sisyphus config.');"

# 6. 重启 OpenCode
```

## 验证安装

**macOS / Linux:**
```bash
# 验证 plugins 符号链接
ls -l ~/.config/opencode/plugins/open-skills.js
ls -l ~/.config/opencode/plugins/coding-fangirl-hooks.ts

# 验证 skills 符号链接
ls -l ~/.config/opencode/skills/open-skills

# 验证 commands 符号链接
ls -l ~/.config/opencode/commands/
```

**Windows CMD:**
```cmd
:: 验证 plugins 符号链接
dir /AL "%USERPROFILE%\.config\opencode\plugins"

:: 验证 skills 符号链接
dir /AL "%USERPROFILE%\.config\opencode\skills"

:: 验证 commands 符号链接
dir /AL "%USERPROFILE%\.config\opencode\commands"
```

**Windows PowerShell:**
```powershell
# 验证 plugins 符号链接
Get-ChildItem "$env:USERPROFILE\.config\opencode\plugins" | Where-Object { $_.LinkType }

# 验证 skills 符号链接
Get-ChildItem "$env:USERPROFILE\.config\opencode\skills" | Where-Object { $_.LinkType }

# 验证 commands 符号链接
Get-ChildItem "$env:USERPROFILE\.config\opencode\commands" | Where-Object { $_.LinkType }
```

应该看到以下 skills 目录：
- `coding-fangirl/`
- `solve-workflow/`
- `perf-workflow/`
- `chinese-format/`
- `frontend-perf/`
- `android-webview-debug/`

应该看到以下 commands 文件：
- `solve.md`
- `perf.md`
- `encourage.md`

## 使用方法

在 OpenCode 中使用 `/skill` 命令加载 skill：

```
/skill coding-fangirl
/skill solve-workflow
/skill perf-workflow
```

或使用触发词：

- 「彩虹屁」「夸夸我」→ 情绪陪伴
- 「明确问题」「分析问题」→ 问题解决工作流
- 「性能分析」「性能优化」→ 性能工作流

或使用命令快捷方式：

- `/solve` → 问题解决工作流
- `/perf` → 性能工作流
- `/encourage` → 情绪陪伴

## 更新

```bash
cd ~/.config/opencode/open-skills
git pull

# 重新链接 commands（如有新增）
for cmd in ~/.config/opencode/open-skills/commands/*.md; do
  ln -sf "$cmd" ~/.config/opencode/commands/
done
```

## 卸载

**macOS / Linux:**
```bash
rm -f ~/.config/opencode/plugins/open-skills.js
rm -f ~/.config/opencode/plugins/coding-fangirl-hooks.ts
rm -rf ~/.config/opencode/skills/open-skills
rm -rf ~/.config/opencode/commands
rm -rf ~/.config/opencode/open-skills
```

**Windows CMD:**
```cmd
del "%USERPROFILE%\.config\opencode\plugins\open-skills.js"
del "%USERPROFILE%\.config\opencode\plugins\coding-fangirl-hooks.ts"
rmdir "%USERPROFILE%\.config\opencode\skills\open-skills"
rmdir "%USERPROFILE%\.config\opencode\commands"
rmdir /S /Q "%USERPROFILE%\.config\opencode\open-skills"
```

**Windows PowerShell:**
```powershell
Remove-Item "$env:USERPROFILE\.config\opencode\plugins\open-skills.js" -Force
Remove-Item "$env:USERPROFILE\.config\opencode\plugins\coding-fangirl-hooks.ts" -Force
Remove-Item "$env:USERPROFILE\.config\opencode\skills\open-skills" -Force
Remove-Item "$env:USERPROFILE\.config\opencode\commands" -Recurse -Force
Remove-Item "$env:USERPROFILE\.config\opencode\open-skills" -Recurse -Force
```
