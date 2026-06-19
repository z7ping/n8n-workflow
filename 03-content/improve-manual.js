const fs = require('fs');

console.log('=== 改进 manual-workflow.json ===');

const original = JSON.parse(fs.readFileSync('./manual-workflow.json', 'utf8'));
console.log(`原始工作流: ${original.name}`);
console.log(`节点数: ${original.nodes.length}`);

const improved = {
  name: '自媒体内容分析 - 手动触发 (改进版)',
  nodes: [],
  connections: {},
  settings: { executionOrder: 'v1' },
  staticData: null,
  tags: ['content-analysis', 'manual', 'improved'],
  active: false
};

// 1. 手动触发器
improved.nodes.push({
  parameters: {},
  id: 'manual-trigger',
  name: '手动触发',
  type: 'n8n-nodes-base.manualTrigger',
  typeVersion: 1,
  position: [250, 300]
});

// 2. 初始化运行节点
improved.nodes.push({
  parameters: {
    jsCode: `// 生成运行 ID\nconst runId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);\nconst startTime = new Date().toISOString();\n\nreturn [{\n  json: {\n    runId: runId,\n    startTime: startTime,\n    status: 'started',\n    input: {\n      title: $input.json.title || '',\n      content: $input.json.content || ''\n    }\n  }\n}];`
  },
  id: 'init-run',
  name: '初始化运行',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [250, 450]
});

// 3. 构建Prompt 节点
improved.nodes.push({
  parameters: {
    jsCode: `// 构建发送给 Ollama 的 Prompt\nconst runId = $input.first().json.runId;\nconst title = $input.first().json.input.title || '';\nconst content = $input.first().json.input.content || '';\nconst model = 'qwen2.5:3b';\n\nif (!title && !content) {\n  throw new Error('请提供标题或内容');\n}\n\nconst prompt = \`你是一位资深的自媒体内容策略专家。请分析以下内容，严格按照指定格式输出。\\n\\n## 待分析内容\\n\\n标题：\${title}\\n\\n正文：\\n\${content}\\n\\n## 五层分类体系\\n\\n1. 流量层（获取曝光）：情绪共鸣、观点对立、反常识、热点\\n2. 理解层（建立认知）：知识科普、深度分析、方法论\\n3. 连接层（建立信任）：人格/IP、日常表达、成长记录\\n4. 包装层（提升传播）：故事、案例拆解、叙事\\n5. 转化层（变现能力）：工具、模板、清单\\n\\n## 请输出以下格式的分析结果\\n\\n【主要类型】xxx层 - xxx型\\n\\n【五层得分】\\n- 流量层：x/10\\n- 理解层：x/10\\n- 连接层：x/10\\n- 包装层：x/10\\n- 转化层：x/10\\n\\n【内容特征】\\n1. xxx\\n2. xxx\\n3. xxx\\n\\n【策略建议】\\n1. xxx\\n2. xxx\\n3. xxx\\n\\n【优化建议】\\n1. xxx\\n2. xxx\\n3. xxx\\n\\n【推荐平台】\\n1. xxx（原因）\\n2. xxx（原因）\\n3. xxx（原因）\\n\\n【改写建议】\\n标题优化：xxx\\n开头优化：xxx\\n正文优化：xxx\\n结尾优化：xxx\\n\\n【平台适配】\\n小红书：xxx\\n抖音：xxx\\n知乎：xxx\`;\n\nreturn [{\n  json: {\n    runId: runId,\n    model: model,\n    prompt: prompt,\n    stream: false,\n    title: title,\n    content: content\n  }\n}];`
  },
  id: 'build-prompt',
  name: '构建Prompt',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [450, 300]
});

// 4. 调用Ollama 节点
improved.nodes.push({
  parameters: {
    method: 'POST',
    url: 'http://localhost:11434/api/generate',
    sendBody: true,
    bodyParameters: {
      parameters: [
        { name: 'model', value: '={{ $json.model }}' },
        { name: 'prompt', value: '={{ $json.prompt }}' },
        { name: 'stream', value: '=false' },
        { name: 'options', value: '={{ {"temperature": 0.7, "num_predict": 4000} }}' }
      ]
    },
    options: { timeout: 300000 }
  },
  id: 'call-ollama',
  name: '调用Ollama',
  type: 'n8n-nodes-base.httpRequest',
  typeVersion: 4.1,
  position: [650, 300],
  continueOnFail: true,
  errorOutput: 'error'
});

// 5. Ollama 错误处理节点
improved.nodes.push({
  parameters: {
    jsCode: `// 处理 Ollama 调用失败\nconst runId = $input.first().json.runId;\nconst error = $json.error || '未知错误';\nconst title = $input.first().json.title || '未知';\nconst timestamp = new Date().toISOString();\n\nconst failureLog = {\n  runId: runId,\n  step: 'call-ollama',\n  error: error,\n  title: title,\n  timestamp: timestamp,\n  status: 'failed',\n  needsReview: true\n};\n\nreturn [{\n  json: {\n    message: 'Ollama 调用失败，已添加到审核队列',\n    failure: failureLog\n  }\n}];`
  },
  id: 'handle-ollama-error',
  name: 'Ollama错误处理',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [650, 500]
});

// 6. 解析结果节点（从原始文件复制）
const parseNode = original.nodes.find(n => n.id === 'parse-result');
if (parseNode) {
  improved.nodes.push(parseNode);
}

// 7. 成功日志节点
improved.nodes.push({
  parameters: {
    jsCode: `// 记录成功运行日志\nconst runId = $input.first().json.runId;\nconst endTime = new Date().toISOString();\n\nconst successLog = {\n  runId: runId,\n  endTime: endTime,\n  status: 'success',\n  timestamp: endTime\n};\n\nreturn [{\n  json: {\n    message: '分析完成',\n    log: successLog\n  }\n}];`
  },
  id: 'log-success',
  name: '记录成功日志',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [1050, 450]
});

// 连接关系
improved.connections = {
  '手动触发': {
    main: [[{ node: '初始化运行', type: 'main', index: 0 }]]
  },
  '初始化运行': {
    main: [[{ node: '构建Prompt', type: 'main', index: 0 }]]
  },
  '构建Prompt': {
    main: [[{ node: '调用Ollama', type: 'main', index: 0 }]]
  },
  '调用Ollama': {
    main: [[{ node: '解析结果', type: 'main', index: 0 }]],
    error: [[{ node: 'Ollama错误处理', type: 'main', index: 0 }]]
  },
  'Ollama错误处理': {
    main: [[{ node: '解析结果', type: 'main', index: 0 }]]
  },
  '解析结果': {
    main: [[{ node: '记录成功日志', type: 'main', index: 0 }]]
  }
};

fs.writeFileSync('./manual-workflow-improved.json', JSON.stringify(improved, null, 2), 'utf8');
console.log(`✅ 改进版本已保存: manual-workflow-improved.json`);
console.log(`节点数: ${improved.nodes.length}`);

// 验证
try {
  JSON.parse(fs.readFileSync('./manual-workflow-improved.json', 'utf8'));
  console.log('✅ JSON 格式验证通过');
} catch (e) {
  console.error('❌ JSON 格式验证失败:', e.message);
  process.exit(1);
}

console.log('🎉 完成！');
