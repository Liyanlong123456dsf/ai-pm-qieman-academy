#!/usr/bin/env bash
# 一键安装 .githooks/ 作为本仓库的 git hooks 路径
# 用法：在仓库根目录跑 ./.githooks/install.sh
#
# 工作原理：通过 git config core.hooksPath 把默认的 .git/hooks/ 替换为
# 仓库内的 .githooks/，这样 hook 文件就能纳入版本控制。

set -e

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "❌ 当前目录不是 git 仓库"
  exit 1
}

HOOKS_DIR="$REPO_ROOT/.githooks"

if [ ! -d "$HOOKS_DIR" ]; then
  echo "❌ 找不到 $HOOKS_DIR"
  exit 1
fi

# 给所有 hook 文件加可执行权限
chmod +x "$HOOKS_DIR"/* 2>/dev/null || true

# 配置 git 使用本仓库 .githooks/
git -C "$REPO_ROOT" config core.hooksPath .githooks

echo "✅ 已配置 core.hooksPath = .githooks"
echo "   生效范围: 本仓库 ($REPO_ROOT)"
echo ""
echo "📋 已安装 hook："
ls -1 "$HOOKS_DIR" | grep -v -E "(install\.sh|README|\.md$)" | sed 's/^/   - /'
echo ""
echo "💡 应急绕过：git commit --no-verify"
echo "💡 卸载：git config --unset core.hooksPath"
