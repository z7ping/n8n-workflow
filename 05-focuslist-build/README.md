# FocusList 拉取最新代码并打包

## 工作流信息
- **n8n ID:** quQvzI1xFPtKXkYK
- **状态:** ✅ 运行中

## 节点流程
```
Code in JavaScript → Webhook1 → Execute a command1 → Send to Feishu1 → Respond to Webhook1
```

## 环境依赖
- 环境变量统一由 `n8n-workflow.env` 管理（见主仓库 README）
- 敏感信息（域名/IP/账号/密码）全部使用 `$env.XXX` 引用，不硬编码

## 变更记录
- 2026-08-04: 敏感信息清理——硬编码域名/IP/账号/密码全部改为环境变量引用
