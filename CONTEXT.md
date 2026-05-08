# 知识网络项目上下文（2026-05-09 v1.6 快照）

> 下次会话直接读这份文件即可恢复上下文，无需重新会话。

---

## 一句话现状

**v1.6 非课程知识已融入可视化子页面 · rag-pipeline +三代架构演进+检索路由+质量瓶颈+8术语+3面试题 · rag-knowledge +数据五类分类+向量vs关键词 · Skill §2.7 融入方法论已沉淀 · 已推送 main**

---

## 核心数据点

| 维度 | 数值 |
|---|---|
| 词条 | 300（NH_GLOSSARY: 272课程 + 12wiki + 16pdf） |
| aliases | ~310 |
| 知识域 | 8（KNOWLEDGE_MAP） |
| 课程节点 | 34（NH_WEEKS · 含 6 周全部） |
| 孤词 | 46（≤60 阈值通过） |
| 未连接概念 | 0 |
| 反向引用覆盖率 | 98.7% |
| P3 alias 命中率 | 53/53 |
| 审计判定 | 9 项（v1.5: +P1_source_validity） |
| 非课程来源 | wiki:RAG技术原理(5.6) / pdf:AI产品-模型选型与评测 |

---

## 第六周全部入库内容

| 课程 ID | 主题 | 来源 |
|---|---|---|
| 025/026/027 | 氢能项目 01/02/03（思敏） | 5月1-2日笔记 + wiki PRD |
| 028/029 | 学姐面试经验 01/02 | 5月2日笔记 |
| 030/031/032 | vibe coding 01/02-上午/02-下午（思敏） | 5月3-4日笔记 |
| 033/034 | 思敏面试技巧 01/02 | 5月5日笔记（v1.3 入库） |

第六周新概念约 **53 个**：
- **RAG 技术**：truth_base / 离线在线链路 / 章节-递归-语义切分 / 多路召回 / RAG 元数据 8 字段 / EasyOCR
- **Agent 架构**：四象限选型 / 多 Agent 协作 / 全局优化 Agent / 三角色群聊 / LangGraph / MCP
- **评测体系**：采纳率 / 事实性错误率 / 风险识别漏检率 / MECE 意图边界 / 评测层次 / 评测集来源
- **vibe coding**：CLAUDE.md / Skill 三件套 / 渐进披露 / Stitch / Cloud Code
- **求职方法论**：面试备战系统 / 与 Claude 共创 / 备战包六组件 / 自我介绍五要素 / STAR 法则 / 简历五要素 / 学历包装话术 / 跨行业简历包装 / 精准投递策略 / 面试反问三阶段
- **B2B 战略**：三类 AI 公司 / 招投标流程 / 架构四层 / 北极星指标 / 三类需求来源
- **项目实战**：查问写审管（氢能五大场景）

---

## skill 自身演进（在 `~/.codeium/windsurf/skills/qieman-academy-knowledge-network/`）

- **v1.0**（首次创建）：20 文件落地，6 输入类型 + 7 references + 3 scripts + 3 templates
- **v1.1**（week 范围扩展 1-5 → 1-6）
- **v1.2**（氢能 wiki 三次入库的方法论关联）
- **v1.3**（⭐ P3 alias 反向命中检查）：发现"alias 顺序与课堂写法错位"陷阱 → 沉淀为永久审计项
- **v1.4**（⭐ 防忘 + 主动发现）：新增 2 个能力闭环
  - **主动发现** `scripts/discover-missing-terms.js`：扫 NH_WEEKS 全部课文，按启发式 score 排序输出"频繁出现但 NH_GLOSSARY 还没释义"的术语候选。首跑 Top 3 强候选：「认知架构」「评测体系」「场景思维」
  - **提交防护** 项目根 `.githooks/pre-commit` + `install.sh`：git commit 前自动跑 audit；P0/P1 失败阻断（exit 1/2）；P2 警告通过（exit 3）；已配置 `core.hooksPath = .githooks`

---

## dev server 与验证

- **server**：`python3 -m http.server 8765 --directory /Users/harry/Desktop/产品经理全流程/ai-pm-qieman-academy`（background command 618）
- **预览**：http://127.0.0.1:8765
- **审计命令**：`node ~/.codeium/windsurf/skills/qieman-academy-knowledge-network/scripts/audit-knowledge-network.js`
- **快照命令**：`node ~/.codeium/windsurf/skills/qieman-academy-knowledge-network/scripts/snapshot-project.js`
- **主动发现**（v1.4）：`node ~/.codeium/windsurf/skills/qieman-academy-knowledge-network/scripts/discover-missing-terms.js`
- **pre-commit hook**（v1.4）：已通过 `git config core.hooksPath .githooks` 安装，commit 时自动跑审计

---

## 下次入库可能的输入

1. **第七周课程录音/笔记**（如果出现）
2. **wiki 补充**（思敏老师未来可能再发更多原始 PRD）
3. **导师手记/脑图**（任何 6 种输入类型）

入库流程：触发 skill `qieman-academy-knowledge-network` → 按 input-types 子文档处理 → 跑 8 项审计 → 通过后生成 snapshot

---

## 已知边界（不要踩的坑）

- **alias 必须覆盖文本实际写法**（v1.3 学到的硬课）：词条加进 NH_GLOSSARY 后，必须扫一遍 NH_WEEKS points 看实际写法是否命中 alias，否则 chip 不渲染
- **cat 字段允许集**：`AI基础 / Agent架构 / RAG / RAG技术 / 文档处理 / 产品方法论 / 用户研究 / 求职方法论 / 评测体系 / 指标体系 / 分析框架 / 工具平台 / 模型服务 / 工作流 / B2B战略 / 项目管理 / 营销增长 / 心理框架 / 思维方法论`（不带空格，写错会 P1 失败）
- **week 字段 1-6 范围**：v1.1 起扩展到 6
- **dev server 端口 8765**：固定不变，刷新即可看效果

---

最后更新：2026-05-08 下午 16:30（v1.4 落地后 · 防忘 + 主动发现）
