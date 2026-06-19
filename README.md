# z7ping-n8n-workflow

基于 n8n 的自动化工作流集合，集成本地 LLM（Ollama）和飞书 API，实现 GitHub 热门项目追踪、AI 翻译摘要、内容发布等功能。

## 🚀 工作流列表

| 序号 | 工作流 | 说明 | 触发方式 | 状态 |
|------|--------|------|----------|------|
| 01 | [github-trending](./01-github-trending/) | GitHub Trending 每日抓取，AI 翻译摘要，写入飞书多维表格 | 定时/Webhook | ✅ 运行中 |
| 02 | [tech-crunch](./02-tech-crunch/) | 科技资讯日报（TechCrunch/HackerNews/ProductHunt），飞书通知 | 定时触发 | ✅ 运行中 |
| 03 | [content](./03-content/) | 自媒体内容分析工作流（Webhook/手动/定时三种模式） | 手动/Webhook/定时 | ✅ 可用 |

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
| `N8N_API_KEY` | n8n API 访问密钥 | `eyJhbG...` |
| `N8N_01_FEISHU_APP_ID` | 飞书应用 App ID | `cli_xxxxx` |
| `N8N_01_FEISHU_APP_SECRET` | 飞书应用 App Secret | - |
| `N8N_01_FEISHU_WEBHOOK` | 飞书机器人 Webhook 地址 | `https://open.feishu.cn/...` |
| `N8N_01_FEISHU_BITABLE_TOKEN` | 飞书多维表格 App Token | - |
| `N8N_01_FEISHU_TABLE_CLASSIC` | 经典项目表 ID | `tbldsiHgdoDx92xo` |
| `N8N_01_FEISHU_TABLE_TRENDING` | 新锐项目表 ID | `tbl3R17M2jNsUDgY` |
| `N8N_01_OLLAMA_HOST` | Ollama 服务地址 | `192.168.31.102` |
| `N8N_01_OLLAMA_PORT` | Ollama 服务端口 | `11434` |

详细命名规范见 [skills/z7ping-n8n-general.md](./skills/z7ping-n8n-general.md)

## 📁 项目结构

```
z7ping-n8n-workflow/
├── README.md                    # 项目说明
├── LICENSE                      # MIT 许可证
├── .env                         # 环境变量（gitignored）
├── .env.example                 # 环境变量模板
├── .gitignore                   # Git 忽略规则
├── skills/                      # 规范文档
│   └── z7ping-n8n-general.md    # N8N 开发通用规范
├── 01-github-trending/          # GitHub Trending 工作流
│   ├── github-trending-workflow.json
│   └── README.md
├── 02-tech-crunch/              # 科技资讯日报工作流
│   ├── 科技资讯日报.json
│   └── README.md
└── 03-content/                  # 自媒体内容分析工作流
    ├── README.md
    ├── advanced-workflow.json
    ├── manual-workflow.json
    └── webhook-workflow.json
```

**目录序号与环境变量对应：**
- `01-*` → `N8N_01_*`
- `02-*` → `N8N_02_*`
- `03-*` → `N8N_03_*`

## 🛠️ 技术栈

- **n8n** - 工作流自动化引擎
- **Ollama** - 本地 LLM 推理（用于翻译和摘要生成）
- **飞书开放平台** - 消息通知 & 多维表格数据存储
- **GitHub API** - Trending 数据抓取

## 📋 踩坑记录

- [n8n HTTP Request 节点 URL 编码问题](./skills/z7ping-n8n-general.md#7-踩坑记录)

## 📄 许可证

本项目基于 [MIT 许可证](./LICENSE) 开源。
