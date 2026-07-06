# GitHub Trending AI 每日追踪

## 工作流信息
- **n8n ID:** cD9h2OAuFYLkJzCb
- **调度:** 每日 9:00 (cron: `0 9 * * *`)
- **执行超时:** 600秒 (10分钟)
- **状态:** ✅ 运行中

## 架构 (v4 — 串行，2026-07-06)

```
触发器 → 初始化配置 → GitHub Search API → 清洗 → 同步翻译 → 写入经典表 → [已禁用]通知 → 异步翻译 → GitHub Trending搜索 → 新锐清洗 → 同步翻译(8条) → 写入新锐表 → 飞书通知(8条+耗时)
```

**串行设计（v4）:**
- 经典分支先跑完（含异步翻译更新）→ 新锐分支才开始
- 两个 GitHub Search API 请求间隔几十秒，避免未认证 rate limit（10次/分钟）导致 403
- v3 并行设计会导致两个 API 同时发出 → 触发 rate limit → 新锐分支 403

**分支说明:**
- **经典分支:** GitHub Search API `stars:>5000`，写入经典表，**不推送通知**（已禁用）
- **新锐分支:** GitHub Search API `created:>7天 stars:>100`，翻译+写入新锐表，**推送飞书通知（8条）**
- 翻译失败不阻断流程，fallback 到英文原文

## 快速开始

### 1. 导入工作流

1. 打开 n8n → Workflows → Import from File
2. 选择 `01-github-trending.json`
3. 导入后不会自动激活，需要手动激活

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env

# 编辑 .env，填入真实值
vim .env
```

需要配置的变量：

| 变量 | 说明 | 获取方式 |
|------|------|---------|
| `N8N_01_FEISHU_APP_ID` | 飞书应用 App ID | [飞书开放平台](https://open.feishu.cn/app) 创建应用 |
| `N8N_01_FEISHU_APP_SECRET` | 飞书应用 App Secret | 同上，应用凭证页面 |
| `N8N_01_FEISHU_WEBHOOK` | 飞书群机器人 Webhook | 群设置 → 群机器人 → 添加自定义机器人 |
| `N8N_01_FEISHU_BITABLE_ID` | 多维表格 Token | 表格 URL 中 `/base/` 后面的部分 |
| `N8N_01_FEISHU_TABLE_CLASSIC` | 经典项目表 ID | 多维表格中创建数据表后获取 |
| `N8N_01_FEISHU_TABLE_TRENDING` | 新锐项目表 ID | 同上 |
| `N8N_01_OLLAMA_HOST` | Ollama 服务地址 | 部署 Ollama 的机器 IP |
| `N8N_01_OLLAMA_PORT` | Ollama 服务端口 | 默认 11434 |

### 3. 注入环境变量到 n8n

n8n 通过 docker-compose 的 `env_file` 读取环境变量：

```bash
# 将 .env 复制到 docker-compose 目录
cp .env /data/z7ping/1-compose/n8n-workflow.env

# 重建 n8n 容器（restart 不会重载 env_file）
cd /data/z7ping/1-compose && docker compose up -d --force-recreate n8n
```

### 4. 配置飞书应用权限

飞书应用需要以下权限（在飞书开放平台 → 应用 → 权限管理中开启）：

- `bitable:app` — 多维表格读写
- `im:message:send_as_bot` — 发送消息（Webhook 方式不需要）

### 5. 部署 Ollama（可选，用于翻译）

如果不需要中文翻译，可以跳过。翻译失败会 fallback 到英文原文。

```bash
# 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 拉取模型
ollama pull qwen2.5:3b

# 启动服务（监听所有网络接口）
OLLAMA_HOST=0.0.0.0 ollama serve
```

## 手动触发

```bash
# 方式一：通过 n8n Webhook（需要内网访问）
curl -s "http://localhost:5678/webhook/github-trending-trigger"

# 方式二：通过 SSH 在 n8n 服务器上触发
ssh root@<n8n-server> "curl -s -m 120 http://localhost:5678/webhook/github-trending-trigger"
```

⚠️ **每次触发 = 完整执行 + 发飞书通知。** 不要反复触发！

## 数据表结构

### 经典表
| 字段 | 类型 | 说明 |
|------|------|------|
| 项目名 | 文本 | GitHub full_name |
| Stars | 数字 | Star 数量 |
| 描述 | 文本 | 英文描述 |
| 中文描述 | 文本 | Ollama 翻译 |
| 链接 | 超链接 | GitHub URL |
| 语言 | 文本 | 主要语言 |
| 拉取日期 | 日期 | 数据采集日期 |

### 新锐表
同经典表结构，额外包含项目创建日期。

## 飞书通知

- 卡片颜色: 紫色 (violet)
- 展示: 8个项目 + 翻译状态 + 写入状态 + 执行耗时
- 每个项目显示: ⭐星数 · +天数 `语言` + 中文描述

## 常见问题

### 新锐分支返回 HTTP 403
**原因:** 两个 GitHub API 并行触发未认证 rate limit。
**解决:** v4 已改为串行。如果仍有问题，配置 GitHub Personal Access Token。

### 翻译不生效（中文描述 = 英文描述）
**原因:** Ollama 服务不可用，fallback 到英文原文。
**排查:** 检查 `N8N_01_OLLAMA_HOST` 是否可达，Ollama 是否运行。

### 飞书表格写入失败
**原因:** 飞书应用权限不足或密钥错误。
**排查:**
1. 检查 `.env` 中 `FEISHU_APP_SECRET` 是否为真实值（不是 `***`）
2. 用 curl 测试: `curl -s -X POST 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal' -H 'Content-Type: application/json' -d '{"app_id":"YOUR_ID","app_secret":"YOUR_SECRET"}' | jq '.code'`
3. 返回 `0` 表示密钥正确

### n8n MCP 工具无法触发内网 webhook
**原因:** MCP 工具 SSRF 安全策略拦截内网 IP。
**解决:** 在 `~/.hermes/config.yaml` 的 n8n MCP 配置中添加 `WEBHOOK_SECURITY_MODE: permissive`，然后重启 Gateway。

## 变更记录
- 2026-07-06: v4 — 串行架构，修复并行导致的 HTTP 403 rate limit
- 2026-06-25: 迁移 Ollama 到 87 GPU 服务器
- 2026-06-17: v3 — 双分支架构，新锐8条+耗时展示，经典通知禁用
- 2026-06-15: v2 — 初版双分支
