# 第二大脑 — Obsidian 知识库

## 目录结构

| 目录 | 用途 |
|------|------|
| `Inbox/` | 口袋捕获入口，手机/网页提交的新内容 |
| `待办总览/` | 待办看板（按年/月分组，卡片式） |
| `写作资料/` | 小说卡片（Dataview 卡片视图） |
| `Clippings/` | 网络剪藏入口，待 ingest.js 处理 |
| `Wiki/` | 消化后的知识笔记（AI 摘要） |
| `灵感/` | 零散创意念头 |
| `笔记/` | 日常知识笔记 |
| `归档/` | 已完成的项目/笔记 |

## 自动化脚本

位于 `C:\Users\胖丁会唱歌\Desktop\pocket-capture\`

| 脚本 | 功能 |
|------|------|
| `server.js` | 本地捕获服务器（:3456），写入 Obsidian + 飞书（文档 + 多维表格） |
| `classify-inbox.js` | 分类 Inbox（规则 / `--ai` / `--lint` 三种模式） |
| `ingest.js` | Clippings → Wiki 智能消化（可选 `--watch` 监听） |
| `organize-inbox.js` | 旧版 AI 分类（被 classify-inbox.js 替代） |

## 自动化流程

```
手机/网页 → index.html → GitHub API → Inbox/*.md
                                        ↓
                               GitHub Action (sync-todos.yml)
                                        ↓
                               待办看板.md + 首页.md
                                        ↓
                               Obsidian 拉取 → 本地编辑
                                        ↓
                               classify-inbox.js (规则/AI/巡检)
                                        ↓
                               待办总览/ 灵感/ 笔记/ 归档/
                                        ↓
                               ingest.js (Clippings → Wiki)
```

### 飞书写入

server.js 捕获时同时写入：
- **飞书文档**：`/docx/v1/documents` → 富文本文档
- **多维表格**：`/bitable/v1/apps/{app_token}/tables/{table_id}/records` → 结构化记录

## 文件规范

- 新笔记 frontmatter：`status`, `type`, `tags`, `priority`, `created`
- 命名：`YYYY-MM-DD-标题.md`
- Inbox 文件 status 为 `inbox` 或 `organized`
- 待办格式：`- [ ] 内容 #优先级`（优先级: 紧急/重要/一般）
