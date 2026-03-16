---
name: file-operation-fallback
version: "1.0.0"
description: 文件操作降级方案。当 Write/StrReplace 工具返回 Error: Aborted 或超时失败时，自动使用 Shell 命令替代。适用于大文件写入、长内容创建等场景。
---

# 文件操作降级方案

> 当标准文件操作工具失败时，自动切换到 Shell 命令替代方案

## 触发场景

以下情况应自动触发降级方案：

- `Write` 工具返回 `Error: Aborted`
- `StrReplace` 工具返回 `Error: Aborted`
- 大文件写入（超过 100 行或内容较长）
- 文件写入超时或被中断

## 降级方案

### 1. 文件写入：使用 cat 替代 Write

当 Write 工具失败时，使用 Shell 的 heredoc 语法：

```bash
cat > /path/to/file << 'EOF'
文件内容...
多行内容...
EOF
```

**注意事项**：
- 使用 'EOF'（带引号）防止变量展开
- 内容中的反引号需要转义
- 内容中不能包含单独的 EOF 行

### 2. 文件修改：使用 sed 替代 StrReplace

当 StrReplace 工具失败时，使用 sed 命令：

```bash
# macOS 语法（需要 -i ''）
sed -i '' 's/原内容/新内容/' /path/to/file

# 使用其他分隔符避免路径冲突
sed -i '' 's|原内容|新内容|' /path/to/file
```

**注意事项**：
- macOS 的 sed 需要 `-i ''`，Linux 只需要 `-i`
- 可使用 `|` 或 `#` 作为分隔符避免路径中的 `/` 冲突
- 特殊字符需要转义

### 3. 文件追加：使用 cat >>

```bash
cat >> /path/to/file << 'EOF'
追加的内容...
EOF
```

### 4. 创建目录后写入

```bash
mkdir -p /path/to/directory && cat > /path/to/directory/file << 'EOF'
文件内容...
EOF
```

## 完整示例

### 示例1：创建 Markdown 文件

```bash
cat > /path/to/README.md << 'EOF'
# 标题

## 内容

- 列表项1
- 列表项2
EOF
```

### 示例2：替换文件中的特定行

```bash
sed -i '' 's|旧的引用路径|新的引用路径|' /path/to/config.md
```

### 示例3：多条 sed 命令

```bash
sed -i '' 's|pattern1|replacement1|' /path/to/file && \
sed -i '' 's|pattern2|replacement2|' /path/to/file
```

## 决策流程

1. 首先尝试使用标准工具（Write/StrReplace）
2. 如果返回 `Error: Aborted`，立即切换到 Shell 方案
3. 使用 Shell 方案后，用 Read 工具验证结果
4. 如果 Shell 方案也失败，报告问题并请求用户协助

## 适用工具对照表

| 标准工具 | Shell 替代方案 | 适用场景 |
|---------|---------------|---------|
| Write | cat > file << 'EOF' | 创建/覆盖文件 |
| StrReplace | sed -i '' 's/old/new/' | 替换文件内容 |
| Delete | rm -f file 或 rm -rf dir | 删除文件/目录 |
| 追加内容 | cat >> file << 'EOF' | 在文件末尾添加内容 |
