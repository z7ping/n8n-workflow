---
name: z7ping-n8n-general
description: "N8N 工作流开发通用规范 — 环境变量命名、工作流结构、安全规范、测试流程。适用于新建或维护 N8N 工作流。"
version: 1.0.0
author: z7ping
license: MIT
metadata:
  hermes:
    tags: [n8n, workflow, automation, naming-convention, security]
    related_skills: [z7ping-n8n-workflow]
---

# N8N 工作流开发通用规范

## 适用范围

本规范适用于所有 N8N 工作流开发，包括：
- 环境变量命名
- 工作流结构设计
- 安全规范
- 测试与部署

---

## 1. 环境变量命名规范

### 格式

```
N8N_XX_服务_用途
  │   │   │     └── 具体用途（APP_ID、TABLE_XXX、HOST、PORT 等）
  │   │   └─────── 服务名（FEISHU、OLLAMA 等）
  │   └─────────── 工作流序号（01、02、03...）
  └─────────────── 平台标识
```

### 设计原则

1. **平台标识 `N8N_`**：所有 n8n 工作流共享此标识，便于在 Docker 环境变量中快速识别
2. **工作流序号 `XX`**：两位数字，用于区分不同工作流的变量（避免多工作流时变量冲突）
3. **服务名**：标识变量所属的服务（如 FEISHU、OLLAMA、SLACK 等）
4. **用途**：具体用途（如 APP_ID、WEBHOOK、HOST、PORT 等）

### 当前工作流分配

| 序号 | 工作流名称 | 说明 |
|------|------------|------|
| 01 | GitHub Trending | GitHub 热门项目追踪 |
| 02 | （待分配） | |
| 03 | （待分配） | |
| ... | ... | |

### GitHub Trending 工作流变量（01）

#### 共享变量（两个分支都要用）

| Key | 说明 | 示例值 |
|-----|------|--------|
| `N8N_01_FEISHU_APP_ID` | 飞书应用 App ID | `cli_xxxxx` |
| `N8N_01_FEISHU_APP_SECRET` | 飞书应用 App Secret | `xxxxx` |
| `N8N_01_FEISHU_WEBHOOK` | 飞书通知 Webhook URL | `https://open.feishu.cn/open-apis/bot/v2/hook/xxx` |
| `N8N_01_FEISHU_BITABLE_TOKEN` | 多维表格 App Token | `xxxxx` |
| `N8N_01_OLLAMA_HOST` | Ollama 服务地址 | `192.168.31.102` |
| `N8N_01_OLLAMA_PORT` | Ollama 服务端口 | `11434` |

#### 分支专用变量

| Key | 说明 | 所属分支 |
|-----|------|----------|
| `N8N_01_FEISHU_TABLE_CLASSIC` | 经典项目表 ID | 经典分支 |
| `N8N_01_FEISHU_TABLE_TRENDING` | 新锐项目表 ID | 新锐分支 |

### 多工作流示例

假设未来添加第二个工作流（如 TechCrunch 抓取）：

```
N8N_02_FEISHU_APP_ID
N8N_02_FEISHU_APP_SECRET
N8N_02_FEISHU_WEBHOOK
N8N_02_SLACK_CHANNEL_ID
N8N_02_SLACK_TOKEN
```

---

## 2. 工作流结构规范

### 文件组织

```
z7ping-n8n-workflow/
├── .env                    # 环境变量（gitignored）
├── .env.example           # 环境变量模板（提交到 git）
├── README.md              # 项目说明
├── skills/                # 规范文档
│   └── z7ping-n8n-general.md
├── workflow-name/         # 每个工作流一个目录
│   ├── workflow.json      # 工作流 JSON（占位符）
│   └── README.md          # 工作流说明
└── ...
```

### 工作流 JSON 规范

1. **禁止硬编码敏感信息**：所有 API Key、Secret、Token 必须使用环境变量
2. **占位符格式**：使用 `YOUR_...` 占位符（如 `YOUR_FEISHU_APP_ID`）
3. **变量引用**：使用 `{{ $env.VARIABLE_NAME }}` 引用环境变量
4. **注释**：在工作流 JSON 的 `notes` 字段中说明用途

### 示例

```json
{
  "name": "GitHub Trending - 经典分支",
  "notes": "每日抓取 GitHub Trending 经典项目，写入飞书多维表格",
  "nodes": [
    {
      "name": "飞书认证",
      "parameters": {
        "appId": "={{ $env.N8N_01_FEISHU_APP_ID }}",
        "appSecret": "={{ $env.N8N_01_FEISHU_APP_SECRET }}"
      }
    }
  ]
}
```

---

## 3. 安全规范

### 敏感信息管理

1. **`.env` 文件**：存放所有真实值，必须加入 `.gitignore`
2. **`.env.example` 文件**：存放占位符，提交到 git，作为配置模板
3. **工作流 JSON**：使用 `YOUR_...` 占位符，不硬编码真实值

### 访问控制

1. **最小权限原则**：飞书应用只申请必要的权限
2. **Token 轮换**：定期更换 API Key 和 Secret
3. **日志脱敏**：调试时不要输出完整的 Token

### 敏感信息清单

| 类型 | 示例 | 存放位置 |
|------|------|----------|
| 飞书 App ID | `cli_xxxxx` | `.env` |
| 飞书 App Secret | `xxxxx` | `.env` |
| 飞书 Webhook URL | `https://...` | `.env` |
| Ollama 地址 | `192.168.31.102` | `.env` |
| 数据库密码 | `xxxxx` | `.env` |

---

## 4. 测试规范

### 测试流程

1. **本地测试**：在 N8N UI 中手动触发工作流
2. **变量检查**：确认所有环境变量已正确配置
3. **输出验证**：检查飞书表格是否正确写入
4. **错误处理**：模拟网络异常、API 限流等场景

### 测试清单

- [ ] 环境变量已配置（`.env` 文件）
- [ ] 工作流 JSON 使用占位符（`YOUR_...`）
- [ ] 飞书表格写入成功
- [ ] 错误通知发送成功
- [ ] 日志无敏感信息泄露

---

## 5. 部署规范

### 部署流程

1. **导出工作流**：从 N8N UI 导出 JSON
2. **脱敏处理**：替换真实值为占位符
3. **提交到 Git**：推送到 Gitea
4. **导入到 N8N**：在 N8N UI 中导入 JSON
5. **配置环境变量**：在 Docker 环境变量中配置真实值

### 版本管理

1. **语义化版本**：使用 `v1.0.0` 格式
2. **变更日志**：在 README.md 中记录重要变更
3. **回滚机制**：保留历史版本的 JSON 文件

---

## 6. 注意事项

1. **序号一旦分配**，应固定不变，避免后续修改导致变量冲突
2. **新工作流上线**前，需在本文档中登记序号和变量列表
3. **环境变量修改**后，需要重启 N8N 容器才能生效
4. **多工作流共用**同一个 N8N 实例时，变量命名必须唯一

---

## 7. 踩坑记录

### n8n HTTP Request 节点 URL 编码问题

**问题描述：** n8n 的 HTTP Request 节点在处理查询参数时，不会自动 URL 编码特殊字符（如 `>`、`<`、`:` 等），导致 GitHub API 等需要特殊字符的查询失败。

**错误示例：**
```json
{
  "queryParameters": {
    "parameters": [
      {
        "name": "q",
        "value": "created:>2026-01-01 stars:>100"
      }
    ]
  }
}
```

**正确写法：** 使用 `={{ }}` 表达式语法，让 n8n 在运行时动态构建并编码 URL：
```json
{
  "queryParameters": {
    "parameters": [
      {
        "name": "q",
        "value": "={{ 'created:>' + new Date(Date.now() - 7*86400000).toISOString().slice(0,10) + ' stars:>100' }}"
      }
    ]
  }
}
```

**或者：** 在 Code 节点中预先编码 URL，然后在 HTTP Request 节点中使用：
```javascript
// 在 Code 节点中
const query = `created:>${date} stars:>100`;
const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`;
return [{ json: { githubUrl: url } }];
```

```json
// 在 HTTP Request 节点中
{
  "url": "={{ $json.githubUrl }}",
  "sendQuery": false
}
```

**验证方法：** 手动测试 GitHub API 查询，确认 URL 编码正确：
```bash
curl "https://api.github.com/search/repositories?q=created%3A%3E2026-01-01+stars%3A%3E100"
```

---

## 相关文档

- [GitHub Trending 工作流说明](../github-trending-flow/README.md)
