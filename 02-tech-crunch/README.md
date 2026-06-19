# 科技资讯日报 - TechCrunch Daily Digest

> 基于 n8n 的自动化科技资讯聚合工作流，每日从多个数据源采集、翻译、摘要后推送至飞书群。

## 功能概述

| 功能 | 说明 |
|------|------|
| 多源采集 | TechCrunch、HackerNews、ProductHunt 三大科技平台 |
| RSS 解析 | 自动解析 RSS/Atom 格式，提取标题、链接、摘要、日期等字段 |
| AI 翻译 | 使用 Ollama 本地大语言模型，将英文资讯批量翻译为中文 |
| 日报生成 | 汇总各源资讯，格式化为飞书卡片 Markdown 格式 |
| 飞书推送 | 通过 Webhook 自动推送到飞书群，支持卡片消息（schema 2.0） |
| 定时执行 | 每日 8:00（北京时间）自动触发，支持手动触发 |

## 数据源

| 数据源 | URL | 说明 |
|--------|-----|------|
| TechCrunch | `https://techcrunch.com/feed/` | 科技创业资讯 RSS，每源取前 10 条 |
| HackerNews | `https://hnrss.org/frontpage?points=50` | HN 热门文章（≥50 分），每源取前 10 条 |
| ProductHunt | `https://www.producthunt.com/feed` | 今日新发布产品 Atom Feed，每源取前 10 条 |

## 工作流节点

```
手动触发 ──┐
            ├──▶ 初始化配置 ──┬──▶ TechCrunch RSS ──▶ 解析TechCrunch ──┐
每日8点触发 ─┘               ├──▶ HackerNews RSS ──▶ 解析HackerNews ──┼──▶ Merge
                             └──▶ ProductHunt RSS ─▶ 解析ProductHunt ──┘
                                                                            │
                                                              准备批量翻译 ◀─┘
                                                                  │
                                                           格式化日报
                                                                  │
                                                           准备飞书消息
                                                                  │
                                                            发送飞书群
                                                                  │
                                                            输出结果
```

### 节点说明

| 节点 | 类型 | 说明 |
|------|------|------|
| 手动触发 | manualTrigger | 手动点击运行工作流 |
| 每日8点触发 | scheduleTrigger | Cron: `0 8 * * *`（每日 08:00） |
| 初始化配置 | Code | 读取环境变量，初始化日期和飞书 Webhook |
| TechCrunch RSS / HackerNews RSS / ProductHunt RSS | HTTP Request | 并行请求各数据源 RSS |
| 解析TechCrunch / 解析HackerNews / 解析ProductHunt | Code | 正则解析 XML/Atom，提取结构化数据 |
| Merge | Merge | 合并三个数据源的结果 |
| 准备批量翻译 | Code | 数据清洗、英文检测、去重、分批（每批 30 条），调用 Ollama 翻译 |
| 格式化日报 | Code | 汇总各源数据，生成飞书 Markdown 格式日报 |
| 准备飞书消息 | Code | 构建飞书交互式卡片消息（interactive card schema 2.0） |
| 发送飞书群 | HTTP Request | POST 到飞书 Webhook |
| 输出结果 | Code | 输出执行摘要（成功/失败状态） |

## 环境变量

在 n8n 中设置以下环境变量：

| 变量名 | 必填 | 说明 | 默认值 |
|--------|------|------|--------|
| `FEISHU_WEBHOOK` | ✅ | 飞书机器人 Webhook URL | `https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_WEBHOOK_TOKEN` |
| `OLLAMA_HOST` | ✅ | Ollama 服务地址 | `http://localhost` |
| `OLLAMA_PORT` | ✅ | Ollama 服务端口 | `11434` |

### 获取飞书 Webhook

1. 在飞书群中添加「自定义机器人」
2. 进入群设置 → 群机器人 → 添加机器人 → 自定义机器人
3. 复制 Webhook 地址，格式为 `https://open.feishu.cn/open-apis/bot/v2/hook/<YOUR_TOKEN>`

### Ollama 本地 LLM

本工作流使用 [Ollama](https://ollama.ai/) 运行本地大语言模型进行翻译，确保：

1. Ollama 已安装并运行：`ollama serve`
2. 已拉取翻译用模型（如 `qwen2.5` 或 `qwen3`）：`ollama pull qwen2.5:7b`
3. 服务监听在 `OLLAMA_HOST:OLLAMA_PORT`（默认 `http://localhost:11434`）

## 导入步骤

1. 打开 n8n 界面（默认 `http://localhost:5678`）
2. 点击右上角菜单 → **Import from File**
3. 选择 `科技资讯日报.json` 文件
4. 在工作流设置中配置环境变量（或在 n8n 的 `.env` 中设置）
5. 点击 **Save** 保存工作流

## 配置说明

### 首次配置

1. **设置飞书 Webhook**：在 n8n 环境变量中配置 `FEISHU_WEBHOOK`
2. **确认 Ollama 可用**：确保 Ollama 服务正常运行，模型已下载
3. **测试运行**：点击「手动触发」节点运行，检查飞书群是否收到日报

### 自定义修改

- **修改触发时间**：编辑「每日8点触发」节点的 Cron 表达式（默认 `0 8 * * *`）
- **修改抓取数量**：在各解析节点的 jsCode 中修改 `count < 10` 的上限
- **修改翻译模型**：在「准备批量翻译」节点中修改 Ollama 的 model 参数
- **修改批次大小**：在「准备批量翻译」节点中调整 `batchSize`（默认 30）
- **保存本地文件**：启用「保存Markdown」节点（默认 disabled）可将日报保存到 `/tmp/tech-digest/`

### 消息格式

飞书推送使用交互式卡片消息（`msg_type: interactive`），包含：
- **标题**：`📊 科技资讯日报 <日期>`
- **内容**：Markdown 格式，按数据源分组展示
- **卡片颜色**：正常为蓝色，有失败源时为红色
- **内容截断**：超过 8000 字符时自动截断

## 注意事项

- 所有 HTTP 请求节点都设置了 `neverError: true`，单个源失败不会阻断整个工作流
- 翻译使用 Ollama 本地模型，首次运行可能较慢（取决于模型大小和硬件）
- 飞书消息有长度限制，超长内容会被截断
- 确保 n8n 所在网络可以访问 TechCrunch、HackerNews、ProductHunt 的 RSS 地址
