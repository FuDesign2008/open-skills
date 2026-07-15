# git-conflict-resolve 参考文档

> 本文档由 SKILL.md 的 Y.1.5「构建产物短路」引用。识别清单与短路规则的完整细节在此，SKILL.md 仅保留流程骨架。

## 构建产物识别清单

构建产物 = 编译/打包后的派生文件（机器生成，无源码意图、内容巨大）。Y.1.5 对累积清单中每个文件按下述规则判定，**满足任一即判定为构建产物**。

### 1. 构建输出目录前缀

文件路径位于以下目录前缀下：

- `dist/`、`build/`、`out/`、`output/`
- `assets/`、`static/`（构建输出用途）
- 打包资源目录：`resources/<bundle>/`（如桌面/移动应用的打包资源目录）
- 其他项目常见产物根：`release/`、`artifacts/`、`.next/`、`.nuxt/`、`target/`（按项目实际）

### 2. 文件特征

- **hash chunk**：文件名匹配 `<name>.<8+位十六进制>.js|css|mjs|map`（webpack/vite/rollup 内容 hash 产物）
  - 正则：`[0-9a-f]{8,}\.(js|css|mjs|map)$`
- **压缩文件**：`.min.js`、`.min.css`
- **source map**：`*.map`
- **二进制资源**：`.wasm`、字体（`.woff2?`、`.ttf`、`.eot`）、图片（`.png`、`.jpg`、`.webp`）

### 3. 项目专属目录补充

使用者可声明项目特有的构建产物目录或文件特征，追加到上述清单。声明后这些路径/特征下的文件同样判定为构建产物。

### 保守默认（重要）

边界模糊的文件（既不在已知构建目录前缀下、又无明确产物特征）**一律不短路**，走 Y.2 语义分析。

理由：误把源码当构建产物短路 → 直接取 release 侧、丢失 main 侧改动，代价远大于多读一个文件。**宁可读也不误判**。

---

## 构建产物短路解决规则（Y.1.5 详情）

构建产物是机器生成的派生物，权威始终是发版分支（release）。短路命中后**不读取三方内容、不做语义分析**，按冲突类型直接取 release 侧。

### 内容冲突（UU）/ Add-Add

```bash
# 取 release 侧（theirs）
git checkout --theirs <FILE> && git add <FILE>
```

### 整目录构建产物

```bash
git rm -rfq <DIR>
git checkout origin/<SOURCE> -- <DIR>
git add <DIR>
```

### rename + 构建产物 hash（不读文件内容）

冲突为 rename + hash（diff3 标签含不同 hash 文件名）时，用 **git rename 元数据**获取两侧文件名，不读取文件内容：

```bash
# git index 的 rename 信息（diff3 下携带 old -> new）
git diff --name-status --diff-filter=U
# 输出形如：R100  old-abc123.js  new-def456.js

# 或（git 2.49+）：git status --renamed-files
```

拿到 `OLD_FILE` / `NEW_FILE` 后：

```bash
git rm -f "$OLD_FILE" 2>/dev/null            # 删旧 hash 文件，避免双 chunk 残留
git checkout origin/<SOURCE> -- "$NEW_FILE"  # 从 release 取新 hash 文件
git add "$NEW_FILE"
```

**Fallback（rename 元数据缺失时）**：降级为「只读冲突标记行」提取文件名——用 `git show :2:<FILE>` 的前若干行 grep `^<<<<<<<` / `>>>>>>>` 标记取文件名，**不读全文**。这是降级路径，优先使用 rename 元数据。

### 解决后验证

短路解决的文件**仍执行 Y.4.5 即时验证**（冲突标记残留扫描），确保取 release 侧后无残留标记。

---

## 为什么不读构建产物

1. **费 token**：minified / bundled 文件单行可达数十万字符，`git show :1:/:2:/:3:` 读取瞬间耗尽大量 token。
2. **语义分析无意义**：压缩代码无「两侧意图」可权衡，Y.2 的意图分析对它无效。
3. **极易出错**：对打包文件做合并极易残留冲突标记或保留旧版本（真实案例：打包 chunk 的冲突标记残留在 minified 文件内、旧 hash 版本被错误保留，需另开修复 MR 回填）。
4. **权威明确**：构建产物权威始终是发版分支（release），无歧义，直接覆盖即可。
