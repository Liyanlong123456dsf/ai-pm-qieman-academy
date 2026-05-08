# `.githooks/` · 仓库内置 git hooks

> 用 `git config core.hooksPath .githooks` 让 hook 文件能纳入版本控制 + 跨机器同步。

---

## 安装

第一次 clone 仓库后，跑一次：

```bash
bash .githooks/install.sh
```

之后所有 commit 自动生效。

---

## 包含的 hook

### `pre-commit`

**目的**：提交 `index.html` 改动前自动跑知识网络审计，防止"改坏了不知道"。

**逻辑**：

1. 检查 stage 中是否包含 `index.html` 改动；不含 → 跳过
2. 调用 `~/.codeium/windsurf/skills/qieman-academy-knowledge-network/scripts/audit-knowledge-network.js`
3. 根据 exit code 决策：
   - `0` 全过 → 允许 commit
   - `1` P0 失败（语法错/KM 概念无释义）→ **阻断**
   - `2` P1 失败（字段非法）→ **阻断**
   - `3` P2 警告（孤词/覆盖率）→ 允许通过，仅警告
   - 其他 → 阻断

**绕过**：

```bash
git commit --no-verify
```

仅在确认改动无误且审计脚本误判时使用。

**前置依赖**：

- `node` 命令可用
- `qieman-academy-knowledge-network` skill 已安装到 `~/.codeium/windsurf/skills/`

如缺任何一个，hook 会自动跳过审计（不阻断 commit）。

---

## 卸载

```bash
git config --unset core.hooksPath
```

恢复默认的 `.git/hooks/` 行为。

---

## 维护规则

- 新增 hook：放到 `.githooks/<hook-name>` + 加可执行权限 + 更新本文档
- 修改现有 hook：直接改文件即可，下次 commit 自动生效
- skill 路径变更：同步更新 `pre-commit` 中的 `SKILL_AUDIT` 常量
