# GitHub Trending AI 每日追踪

## 工作流信息
- **n8n ID:** YOUR_N8N_INSTANCE_ID
- **调度:** 每日 9:00 (cron: `0 9 * * *`)
- **执行超时:** 600秒 (10分钟)
- **状态:** ✅ 运行中

## 架构 (v3 — 双分支，仅新锐推送)

```
              ┌→ GitHub Search API → 数据清洗 → 同步翻译 → 写入经典表 → [已禁用]通知 → 异步翻译
触发器 → 初始化┤
              └→ GitHub Trending搜索 → 新锐清洗 → 同步翻译(8条) → 写入新锐表 → 飞书通知(8条+耗时)
```

- **经典分支:** stars>5000 的老牌项目，仅写表格，**不推送通知**
- **新锐分支:** 最近7天新建且 stars>100 的项目，翻译+表格+飞书通知

## 飞书通知 (仅新锐)
- 卡片颜色: 紫色 (violet)
- 展示: 8个项目 + 翻译状态 + 写入状态 + 执行耗时
- 翻译: Ollama qwen2.5:3b @ YOUR_OLLAMA_HOST (Termux)

## 数据表
- **经典表:** `tbldsiHgdoDx92xo` (数据表)
- **新锐表:** `tbl3R17M2jNsUDgY` (新锐项目)

## 手动触发
```bash
curl -s "http://localhost:5678/webhook/github-trending-trigger"
```

## 环境依赖
- YOUR_OLLAMA_HOST (Redmi Termux): Ollama 0.30.8, SSH 8022, OLLAMA_HOST=0.0.0.0
- 飞书应用: YOUR_APP_ID
- 飞书 Webhook: YOUR_WEBHOOK_TOKEN

## 变更记录
- 2026-06-17: v3 — 双分支架构，新锐8条+耗时展示，经典通知禁用，超时600s
- 2026-06-15: v2 — 初版双分支
