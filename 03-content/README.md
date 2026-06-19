# n8n + Ollama 自媒体内容分析工作流

本地部署的免费方案，无需 API 费用，数据完全私有。

> **📢 2026-04-13 更新**
> - 修复：统一模型名称为 `qwen2.5:7b`（解决版本不一致问题）
> - 修复：统一 Ollama URL 为 `http://host.docker.internal:11434`（Docker 环境通用）
> - 修复：Advanced 版本数据库凭证占位符改为 `POSTGRES_CREDENTIAL_ID`
> - 新增：支持商业 API（OpenAI/Claude/DeepSeek 等）配置说明

---

## 🏗️ 架构图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   输入方式   │────▶│    n8n      │────▶│   Ollama    │
│             │     │   工作流     │     │  本地模型   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ • Webhook   │     │ • 接收内容   │     │ • qwen2.5   │
│ • 手动触发   │     │ • 构建Prompt│     │ • qwen3.5   │
│ • 定时任务   │     │ • 调用Ollama │     │             │
└─────────────┘     │ • 解析结果   │     └─────────────┘
                    │ • 输出格式化 │            │
                    └─────────────┘            │
                           │                   │
                           ▼                   │
                    ┌─────────────┐            │
                    │   输出方式   │◀───────────┘
                    ├─────────────┤
                    │ • HTTP响应  │
                    │ • 保存到DB  │
                    │ • 发送通知  │
                    │ • 生成报告  │
                    └─────────────┘
```

---

## 📋 前置要求

### 1. 已安装服务
- ✅ n8n (免费版)
- ✅ Ollama
- ✅ qwen2.5 或 qwen3.5 模型

### 2. 确认 Ollama 可访问
```bash
# 测试 Ollama 是否运行
curl http://localhost:11434/api/tags

# 测试模型调用
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5",
  "prompt": "你好"
}'
```

### 3. n8n 配置
确保 n8n 容器可以访问 Ollama：
- 如果都是 Docker 部署，使用 `host.docker.internal:11434`
- 如果是本机部署，使用 `localhost:11434`

---

## 🔧 工作流设计

### 方案一：Webhook API 方式（推荐）

通过 HTTP 请求触发分析，返回 JSON 结果。

**适用场景：**
- 与其他系统集成
- 构建自己的前端界面
- 批量处理

### 方案二：手动触发方式

直接在 n8n 界面输入内容，查看结果。

**适用场景：**
- 快速测试
- 个人使用
- 不需要外部集成

---

## 📁 文件说明

| 文件 | 说明 | 适用场景 |
|------|------|----------|
| `webhook-workflow.json` | Webhook API 方式工作流 | 与其他系统集成、前端调用 |
| `manual-workflow.json` | 手动触发方式工作流 | n8n 界面直接使用 |
| `advanced-workflow.json` | 高级版本（含数据库保存） | 需要保存分析历史 |
| `frontend-example.html` | 前端界面示例 | 可直接使用的分析界面 |

### 快速选择

```
┌─────────────────────────────────────────────────────────────┐
│  你的需求                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  想快速测试？ ────────▶  manual-workflow.json               │
│                                                             │
│  想接入自己的系统？ ──▶  webhook-workflow.json              │
│                         + frontend-example.html             │
│                                                             │
│  想保存历史记录？ ────▶  advanced-workflow.json             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 5 分钟快速上手

### 方式一：使用现成的前端界面（推荐）

1. **导入 Webhook 工作流**
   - 打开 n8n → Workflows → Import → 选择 `webhook-workflow.json`

2. **配置 Ollama 地址**
   - 点击「调用Ollama」节点
   - 修改 URL 为你的 Ollama 地址
   - 默认: `http://host.docker.internal:11434/api/generate`

3. **激活工作流**
   - 点击右上角开关激活工作流

4. **打开前端界面**
   - 用浏览器打开 `frontend-example.html`
   - 输入 Webhook 地址和内容
   - 点击分析！

### 方式二：纯 n8n 界面使用

1. **导入手动工作流**
   - 导入 `manual-workflow.json`

2. **配置并运行**
   - 配置 Ollama 地址
   - 点击「Execute Workflow」
   - 在弹出的表单中输入内容

---

## 🚀 详细部署步骤

### 导入工作流

1. 打开 n8n 界面
2. 点击左侧 **"Workflows"**
3. 点击右上角 **"Import"** → **"Import from File"**
4. 选择对应的 JSON 文件

### 配置 Ollama 节点

1. 导入后点击 **Ollama 节点**
2. 配置以下参数：
   - **Base URL**: `http://host.docker.internal:11434` (Docker) 或 `http://localhost:11434` (本机)
   - **Model**: `qwen2.5` 或 `qwen3.5`
   - **Options**:
     - Temperature: `0.7`
     - Max Tokens: `4000`

### 测试运行

**Webhook 方式：**
```bash
curl -X POST http://localhost:5678/webhook/content-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "title": "你的文章标题",
    "content": "你的文章内容..."
  }'
```

**手动方式：**
1. 点击 **"Execute Workflow"**
2. 在弹出的表单中输入标题和内容
3. 查看执行结果

---

## 🔌 多模型支持

本项目支持两种方式调用大模型：

| 方式 | 成本 | 速度 | 质量 | 适用场景 |
|------|------|------|------|----------|
| **Ollama（本地）** | 免费 💰 | 取决于硬件 | 中等 | 省钱首选，数据完全私有 |
| **OpenAI API** | 按量付费 | 快 | 高 | 追求质量，预算充足 |
| **Claude API** | 按量付费 | 快 | 很高 | 需要最强分析能力 |
| **DeepSeek** | 便宜 | 快 | 高 | 性价比之选 |

### 配置商业 API

如果你不想部署 Ollama，可以使用商业 API：

#### 1. 配置 OpenAI

1. 获取 API Key：[https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. 在 n8n 中创建 **OpenAI** 凭证
3. 将「调用 Ollama」节点替换为 **OpenAI** 节点
4. 选择模型：`gpt-4o-mini`（便宜）或 `gpt-4o`（高质量）

**成本估算**：
- gpt-4o-mini：约 ¥0.004/次（1000 字以内）
- gpt-4o：约 ¥0.04/次（1000 字以内）

#### 2. 配置 Claude (Anthropic)

1. 获取 API Key：[https://console.anthropic.com/](https://console.anthropic.com/)
2. 在 n8n 中创建 **HTTP Request** 节点调用 Claude API
3. 或使用第三方中转服务

**成本估算**：
- Claude 3 Haiku：约 ¥0.003/次
- Claude 3 Sonnet：约 ¥0.015/次
- Claude 3 Opus：约 ¥0.15/次

#### 3. 配置 DeepSeek

1. 获取 API Key：[https://platform.deepseek.com/](https://platform.deepseek.com/)
2. 在 n8n 中创建 **HTTP Request** 节点
3. Endpoint: `https://api.deepseek.com/chat/completions`

**成本估算**：
- DeepSeek Chat：约 ¥0.001/次（非常便宜）

#### 4. 使用 OpenRouter（统一接口）

OpenRouter 提供统一接口访问多个模型：

1. 注册：[https://openrouter.ai/](https://openrouter.ai/)
2. 使用 HTTP Request 节点：
   - URL: `https://openrouter.ai/api/v1/chat/completions`
   - Header: `Authorization: Bearer YOUR_KEY`
   - Body 中的 `model` 可以是 `openai/gpt-4o`、`anthropic/claude-3-sonnet` 等

---

## 🤖 模型选择建议

### Ollama 本地模型 vs 商业 API

| 模型 | 推荐度 | 特点 | 适用场景 |
|------|--------|------|----------|
| **qwen2.5:7b** | ⭐⭐⭐⭐⭐ | 速度快，占用资源少 | 日常分析，快速测试 |
| **qwen2.5:14b** | ⭐⭐⭐⭐ | 质量更好，速度适中 | 正式使用 |
| **qwen3.5** | ⭐⭐⭐⭐ | 最新版本，能力强 | 高质量要求 |

### 拉取模型

```bash
# 拉取 qwen2.5 7B（推荐）
ollama pull qwen2.5:7b

# 拉取 qwen2.5 14B
ollama pull qwen2.5:14b

# 拉取 qwen3.5
ollama pull qwen3.5

# 查看已安装模型
ollama list
```

### 修改工作流中的模型

在「构建Prompt」节点中修改：
```javascript
return [{
  json: {
    model: 'qwen2.5:7b',  // 修改这里
    // ...
  }
}];
```

---

## 📝 Prompt 设计（Ollama 专用版）

针对本地模型优化的 Prompt：

```
你是一位资深的自媒体内容策略专家。请分析以下内容，严格按照指定格式输出。

## 待分析内容

标题：{{$json.title}}

正文：
{{$json.content}}

## 五层分类体系

1. 流量层（获取曝光）：情绪共鸣、观点对立、反常识、热点
2. 理解层（建立认知）：知识科普、深度分析、方法论
3. 连接层（建立信任）：人格/IP、日常表达、成长记录
4. 包装层（提升传播）：故事、案例拆解、叙事
5. 转化层（变现能力）：工具、模板、清单

## 请输出以下格式的分析结果

【主要类型】xxx层 - xxx型

【五层得分】
- 流量层：x/10
- 理解层：x/10
- 连接层：x/10
- 包装层：x/10
- 转化层：x/10

【内容特征】
1. xxx
2. xxx
3. xxx

【策略建议】
1. xxx
2. xxx
3. xxx

【优化建议】
1. xxx
2. xxx
3. xxx

【推荐平台】
1. xxx（原因）
2. xxx（原因）
3. xxx（原因）

【改写建议】
标题优化：xxx
开头优化：xxx
正文优化：xxx
结尾优化：xxx

【平台适配】
小红书：xxx
抖音：xxx
知乎：xxx
```

---

## 🧪 测试 API

### 测试 Ollama

```bash
# 查看模型列表
curl http://localhost:11434/api/tags

# 测试模型调用
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5",
  "prompt": "你好",
  "stream": false
}'
```

### 测试 n8n Webhook

```bash
# 测试 Webhook 工作流
curl -X POST http://localhost:5678/webhook/content-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试标题",
    "content": "这是一段测试内容，用于验证工作流是否正常工作。"
  }'
```

---

## 🔌 节点详解

### 1. Webhook 节点（触发器）

```json
{
  "path": "content-analyze",
  "method": "POST",
  "responseMode": "lastNode",
  "options": {
    "rawBody": false
  }
}
```

### 2. Set 节点（构建 Prompt）

```javascript
// 构建发送给 Ollama 的消息
const title = $json.body.title || '';
const content = $json.body.content || '';

const prompt = `你是一位资深的自媒体内容策略专家...`;

return {
  json: {
    model: "qwen2.5",
    prompt: prompt,
    stream: false
  }
};
```

### 3. HTTP Request 节点（调用 Ollama）

```json
{
  "method": "POST",
  "url": "http://host.docker.internal:11434/api/generate",
  "body": {
    "model": "={{ $json.model }}",
    "prompt": "={{ $json.prompt }}",
    "stream": false,
    "options": {
      "temperature": 0.7,
      "num_predict": 4000
    }
  }
}
```

### 4. Code 节点（解析结果）

```javascript
// 解析 Ollama 返回的文本
const response = $json.response;

// 提取各个部分
const result = {
  primaryLayer: extractSection(response, '【主要类型】'),
  scores: {
    traffic: extractScore(response, '流量层'),
    understanding: extractScore(response, '理解层'),
    connection: extractScore(response, '连接层'),
    packaging: extractScore(response, '包装层'),
    conversion: extractScore(response, '转化层')
  },
  characteristics: extractList(response, '【内容特征】'),
  suggestions: extractList(response, '【策略建议】'),
  optimizationTips: extractList(response, '【优化建议】'),
  platforms: extractPlatforms(response),
  rewrite: {
    title: extractRewrite(response, '标题优化'),
    hook: extractRewrite(response, '开头优化'),
    body: extractRewrite(response, '正文优化'),
    ending: extractRewrite(response, '结尾优化')
  },
  rawResponse: response
};

return [{ json: result }];

// 辅助函数
function extractSection(text, marker) {
  const match = text.match(new RegExp(marker + '(.+?)(?=【|$)', 's'));
  return match ? match[1].trim() : '';
}

function extractScore(text, layer) {
  const match = text.match(new RegExp(layer + '：(.+?)/10'));
  return match ? parseInt(match[1]) : 0;
}

function extractList(text, marker) {
  const section = extractSection(text, marker);
  return section.split('\n')
    .filter(line => line.match(/^\d+\./))
    .map(line => line.replace(/^\d+\.\s*/, '').trim());
}

function extractPlatforms(text) {
  const section = extractSection(text, '【推荐平台】');
  return section.split('\n')
    .filter(line => line.match(/^\d+\./))
    .map(line => {
      const match = line.match(/^\d+\.\s*(.+?)（/);
      return match ? match[1] : '';
    });
}

function extractRewrite(text, type) {
  const section = extractSection(text, '【改写建议】');
  const match = section.match(new RegExp(type + '：(.+?)(?=\n|$)', 's'));
  return match ? match[1].trim() : '';
}
```

---

## 🎨 前端集成示例

### HTML + JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>内容分析工具</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    textarea { width: 100%; height: 200px; margin: 10px 0; }
    button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
    #result { margin-top: 20px; white-space: pre-wrap; background: #f5f5f5; padding: 20px; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>自媒体内容分析</h1>
  
  <input type="text" id="title" placeholder="标题" style="width: 100%; padding: 10px; margin-bottom: 10px;">
  <textarea id="content" placeholder="正文内容..."></textarea>
  <button onclick="analyze()">分析</button>
  
  <div id="result"></div>

  <script>
    async function analyze() {
      const title = document.getElementById('title').value;
      const content = document.getElementById('content').value;
      
      document.getElementById('result').textContent = '分析中...';
      
      try {
        const response = await fetch('http://localhost:5678/webhook/content-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content })
        });
        
        const result = await response.json();
        document.getElementById('result').textContent = JSON.stringify(result, null, 2);
      } catch (error) {
        document.getElementById('result').textContent = '错误: ' + error.message;
      }
    }
  </script>
</body>
</html>
```

---

## 🔧 高级配置

### 1. 添加数据库保存

在解析节点后添加 **Postgres** 或 **SQLite** 节点，保存分析历史。

### 2. 添加通知

分析完成后通过 **Telegram** 或 **Email** 发送通知。

### 3. 批量处理

使用 **Split In Batches** 节点批量分析多篇文章。

### 4. 定时任务

使用 **Schedule Trigger** 定时分析 RSS 源或数据库中的新内容。

---

## ✅ 部署检查清单

在正式使用前，请确认以下步骤已完成：

### 基础环境
- [ ] n8n 已安装并运行（访问 http://localhost:5678 正常）
- [ ] 如果使用 Ollama：Ollama 服务已启动
- [ ] 如果使用 API：已获取 API Key 并在 n8n 配置凭证

### 工作流配置
- [ ] 导入工作流 JSON 文件
- [ ] 配置模型节点（Ollama 或 OpenAI 等）
- [ ] 修改 URL 为正确的地址（host.docker.internal 或 localhost）
- [ ] 激活工作流（点击右上角开关）

### 测试验证
- [ ] 手动触发一次测试
- [ ] 检查解析结果是否正确（五层得分、建议等）
- [ ] Webhook 方式：用 curl 或前端测试调用
- [ ] 检查 n8n Execution 日志无报错

### 生产准备（可选）
- [ ] 配置错误通知（当分析失败时通知管理员）
- [ ] 配置数据库保存（需要时）
- [ ] 设置访问控制（Webhook 添加 API Key 验证）
- [ ] 配置备份策略

---

## 🔒 安全建议

### Webhook 安全

**生产环境必须添加身份验证**：

1. **Header 验证**：在 Webhook 节点中配置 Header 验证
   ```
   X-API-Key: your-secret-key
   ```

2. **IP 白名单**：限制允许访问 Webhook 的 IP 地址

3. **HTTPS**：生产环境使用 HTTPS 访问 n8n

### API Key 安全

- 不要将 API Key 硬编码在工作流中
- 使用 n8n 的 Credentials 功能安全存储
- 定期轮换 API Key

### 内容安全

- 对输入内容进行长度限制（防止超长内容导致内存溢出）
- 敏感内容建议本地部署 Ollama，不走第三方 API

---

## ⚡ 性能优化

### 减少响应时间

1. **使用小模型**：qwen2.5:7b 比 14b 快 2-3 倍
2. **限制输出长度**：减少 `num_predict` 到 2000（够用即可）
3. **启用 GPU**：Ollama 使用 GPU 加速推理
4. **模型预热**：首次调用较慢，可先发送一个空请求预热

### 批量处理优化

- 使用 **Split In Batches** + **Wait** 节点，避免并发过高
- 批量处理时设置合理的延迟（每秒 1-2 个请求）

### 缓存策略

- 对相同内容使用缓存，避免重复调用 API
- 可以在 n8n 中添加 **Function** 节点实现简单缓存

---

## ❓ 常见问题

### Q: Advanced 版本数据库配置？

**A:** 导入 `advanced-workflow.json` 后需要配置 Postgres 凭证：

1. 打开 n8n → Settings → Credentials
2. 添加 Postgres 凭证
3. 在「保存到数据库」节点选择刚创建的凭证
4. 替换 `POSTGRES_CREDENTIAL_ID` 为实际凭证 ID

**数据库表结构**（需预先创建）：
```sql
CREATE TABLE content_analysis (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(500),
  content_preview TEXT,
  content_length INTEGER,
  model VARCHAR(50),
  temperature FLOAT,
  primary_layer VARCHAR(50),
  primary_type VARCHAR(50),
  score_traffic INTEGER,
  score_understanding INTEGER,
  score_connection INTEGER,
  score_packaging INTEGER,
  score_conversion INTEGER,
  overall_score INTEGER,
  characteristics JSON,
  suggestions JSON,
  optimization_tips JSON,
  recommended_platforms JSON,
  rewrite_title TEXT,
  rewrite_hook TEXT,
  rewrite_body TEXT,
  rewrite_ending TEXT,
  platform_xiaohongshu TEXT,
  platform_douyin TEXT,
  platform_zhihu TEXT,
  raw_response TEXT,
  created_at TIMESTAMP
);
```

### Q: Ollama 连接失败？

A: 检查以下几点：
1. Ollama 是否运行：`curl http://localhost:11434/api/tags`
2. n8n 容器是否能访问 Ollama 地址
3. 如果是 Docker，尝试使用 `host.docker.internal:11434`

### Q: 模型响应太慢？

A: 
1. 使用更小的模型（如 qwen2.5:7b 代替 qwen2.5:14b）
2. 减少 max_tokens
3. 使用 GPU 加速 Ollama

### Q: 输出格式不稳定？

A:
1. 在 Prompt 中强调"严格按照格式输出"
2. 使用 few-shot 示例
3. 降低 temperature 到 0.3-0.5

### Q: 如何切换到商业 API？

A: 参考「多模型支持」章节，简要步骤：
1. 获取 API Key
2. 在 n8n 中创建对应凭证
3. 将 HTTP Request 节点（Ollama）替换为对应服务的节点
4. 修改请求格式（商业 API 通常是 Chat Completion 格式）

### Q: 分析结果为空或报错？

A: 检查步骤：
1. 查看 n8n Execution 日志，定位报错节点
2. 检查模型节点返回的原始响应
3. 确认输入内容不为空且长度适中（建议 100-5000 字）
4. 检查 API Key 是否有效（余额是否充足）

### Q: 如何修改分析的维度？

A: 编辑「构建 Prompt」节点中的 prompt 内容：
- 修改五层分类的定义
- 添加或删除输出字段
- 调整评分标准

注意：修改 prompt 后需要同步修改「解析结果」节点中的解析逻辑。

### Q: 支持分析英文内容吗？

A: 支持：
- qwen 系列模型支持中英双语
- 使用 OpenAI/Claude 等商业 API 时支持多语言
- 可以在 prompt 中指定"请用中文/英文输出分析结果"

---

## 📚 参考

- [n8n 文档](https://docs.n8n.io/)
- [Ollama API 文档](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Qwen 模型](https://github.com/QwenLM/Qwen)
