# z7ping-n8n-workflow

基于 n8n 的自动化工作流集合，集成 Ollama 本地 LLM、飞书 API、ntfy 推送、GitHub API、Gitea，实现 GitHub 热门项目追踪、资讯日报、任务通知、知识推送等自动化功能。

## 🚀 工作流列表

| 序号 | 工作流 | 说明 | 触发方式 | 状态 |
|------|--------|------|----------|------|
| 01 | [github-trending](./01-github-trending/) | GitHub Trending 每日抓取，AI 翻译摘要，写入飞书多维表格 | 定时/Webhook | ✅ 运行中 |
| 02 | [tech-crunch](./02-tech-crunch/) | 科技资讯日报（TechCrunch/HackerNews/ProductHunt），飞书+ntfy 通知 | 定时触发 | ✅ 运行中 |
| 03 | [content](./03-content/) | 自媒体内容分析工作流（历史参考，服务器已下线） | - | ⚠️ 已下线 |
| 04 | [vikunja-to-feishu](./04-vikunja-to-feishu/) | Vikunja 任务事件推送飞书群 | Webhook | ✅ 运行中 |
| 05 | [news-daily](./05-news-daily/) | 新闻联播日报（CCTV 新闻联播，飞书通知） | Webhook | ✅ 运行中 |
| 06 | [obsidian-daily](./06-obsidian-daily/) | Obsidian 知识每日推送（Gitea Wiki → 飞书） | 定时触发 | ⏸ 未激活 |
| 07 | [ntfy-push](./07-ntfy-push/) | ntfy 推送通知（通用） | Webhook/手动 | ⏸ 未激活 |

## 📌 版本管理

- 版本号由 **git tag** 管理（语义化版本，如 `v1.0.0`）
- 变更说明由各目录 **CHANGELOG.md** 记录
- 备份流程：改服务器工作流 → 导出 JSON 更新仓库 → commit → tag → push（Gitea + GitHub）
- n8n 内部 `versionCounter` 是编辑次数，非版本号，不用于版本管理

## ⚡ 快速开始

### 1. 安装 n8n

```bash
# 使用 Docker 安装（推荐）
docker run -d --name n8n -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的飞书应用凭证和 Ollama 配置
```

### 3. 导入工作流

```bash
# 使用 n8n CLI 导入
docker exec n8n n8n import:workflow --input=/path/to/workflow.json

# 或在 n8n UI 中导入
# 1. 打开 n8n 界面（默认 http://localhost:5678）
# 2. 点击 Import from File
# 3. 选择对应目录下的 .json 工作流文件
```

## 🔧 环境变量

**命名规范**: `N8N_XX_服务_用途`

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `N8N_API_KEY` | n8n API 访问密钥 | `n8n_xxxxx` |
| `N8N_01_FEISHU_APP_ID` | 飞书应用 App ID | `cli_xxxxx` |
| `N8N_01_FEISHU_APP_SECRET` | 飞书应用 App Secret | - |
| `N8N_01_FEISHU_WEBHOOK` | 飞书机器人 Webhook 地址（群 A） | `https://open.feishu.cn/...` |
| `N8N_01_FEISHU_BITABLE_ID` | 飞书多维表格 App Token | - |
| `N8N_01_FEISHU_TABLE_CLASSIC` | 经典项目表 ID | `tbldsiHgdoDx92xo` |
| `N8N_01_FEISHU_TABLE_TRENDING` | 新锐项目表 ID | `tbl3R17M2jNsUDgY` |
| `N8N_01_GITHUB_TOKEN` | GitHub API Token | `ghp_xxxxx` |
| `N8N_01_OLLAMA_HOST` | Ollama 服务地址 | `your_ollama_host` |
| `N8N_01_OLLAMA_PORT` | Ollama 服务端口 | `11434` |
| `NTFY_URL` | ntfy 服务地址 | `https://ntfy.example.com` |
| `NTFY_TOPIC` | ntfy 推送 topic | `your-topic` |
| `NTFY_USER` | ntfy 账号 | `your_user` |
| `NTFY_PASS` | ntfy 密码 | - |
| `GITEA_URL` | Gitea 地址（Obsidian 知识推送用） | `http://your-gitea-host:port` |
| `N8N_FEISHU_WEBHOOK_B` | 飞书 Webhook 地址（群 B，Vikunja/FocusList 用） | `https://open.feishu.cn/...` |

详细命名规范见 [skills/z7ping-n8n-general.md](./skills/z7ping-n8n-general.md)

## 📁 项目结构

```
z7ping-n8n-workflow/
├── README.md                    # 项目说明
├── LICENSE                      # MIT 许可证
├── CHANGELOG.md                 # 版本变更记录
├── .env                         # 环境变量（gitignored）
├── .env.example                 # 环境变量模板
├── .gitignore                   # Git 忽略规则
├── skills/                      # 规范文档
│   └── z7ping-n8n-general.md    # N8N 开发通用规范
├── 01-github-trending/          # GitHub Trending 工作流
│   ├── 01-github-trending.json
│   ├── README.md
│   └── CHANGELOG.md
├── 02-tech-crunch/              # 科技资讯日报工作流
│   ├── 02-tech-crunch.json
│   ├── README.md
│   └── CHANGELOG.md
├── 03-content/                  # 自媒体内容分析（历史参考）
│   ├── 03-content.json
│   ├── README.md
│   └── CHANGELOG.md
├── 04-vikunja-to-feishu/        # Vikunja → 飞书
│   ├── 04-vikunja-to-feishu.json
│   ├── README.md
│   └── CHANGELOG.md
├── 05-news-daily/               # 新闻联播日报
│   ├── 05-news-daily.json
│   ├── README.md
│   └── CHANGELOG.md
├── 06-obsidian-daily/           # Obsidian 知识推送
│   ├── 06-obsidian-daily.json
│   ├── README.md
│   └── CHANGELOG.md
└── 07-ntfy-push/                # ntfy 推送通知
    ├── 07-ntfy-push.json
    ├── README.md
    └── CHANGELOG.md
```

**目录序号与环境变量对应：**
- `01-*` → `N8N_01_*`
- `02-*` → `N8N_02_*`
- 通用变量（`NTFY_*`、`GITEA_URL`、`N8N_FEISHU_WEBHOOK_B`）不区分序号

## 🛠️ 技术栈

- **n8n** - 工作流自动化引擎
- **Ollama** - 本地 LLM 推理（用于翻译和摘要生成）
- **飞书开放平台** - 消息通知 & 多维表格数据存储
- **GitHub API** - Trending 数据抓取
- **ntfy** - 轻量推送通知
- **Gitea** - 知识库/Wiki 数据源

## 📋 踩坑记录

- [n8n HTTP Request 节点 URL 编码问题](./skills/z7ping-n8n-general.md#7-踩坑记录)

## 📄 许可证

本项目基于 [MIT 许可证](./LICENSE) 开源。
