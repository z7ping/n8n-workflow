const fs = require('fs');

console.log('=== 改进 advanced-workflow.json ===');

const original = JSON.parse(fs.readFileSync('./advanced-workflow.json', 'utf8'));
console.log(`原始工作流: ${original.name}`);
console.log(`节点数: ${original.nodes.length}`);

const improved = {
  name: '自媒体内容分析 - 高级版 (改进版)',
  nodes: [],
  connections: {},
  settings: { executionOrder: 'v1' },
  staticData: null,
  tags: ['content-analysis', 'advanced', 'improved'],
  active: false
};

// 从原始文件复制所有节点，但添加错误处理
for (const node of original.nodes) {
  const newNode = { ...node };
  
  // 为 HTTP Request 节点添加错误处理
  if (node.id === 'call-ollama') {
    newNode.continueOnFail = true;
    newNode.errorOutput = 'error';
  }
  
  // 为数据库节点添加错误处理
  if (node.id === 'save-to-db') {
    newNode.continueOnFail = true;
    newNode.errorOutput = 'error';
  }
  
  improved.nodes.push(newNode);
}

// 添加初始化运行节点
improved.nodes.push({
  parameters: {
    jsCode: `// 生成运行 ID\nconst runId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);\nconst startTime = new Date().toISOString();\n\nreturn [{\n  json: {\n    runId: runId,\n    startTime: startTime,\n    status: 'started',\n    input: {\n      title: $input.body?.title || '',\n      content: $input.body?.content || ''\n    }\n  }\n}];`
  },
  id: 'init-run',
  name: '初始化运行',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [250, 450]
});

// 添加错误处理节点
improved.nodes.push({
  parameters: {
    jsCode: `// 处理失败\nconst runId = $input.first().json.runId || 'unknown';\nconst error = $json.error || '未知错误';\nconst timestamp = new Date().toISOString();\n\nconst failureLog = {\n  runId: runId,\n  step: 'call-ollama-or-db',\n  error: error,\n  timestamp: timestamp,\n  status: 'failed',\n  needsReview: true\n};\n\nreturn [{\n  json: {\n    message: '处理失败，已添加到审核队列',\n    failure: failureLog\n  }\n}];`
  },
  id: 'handle-error',
  name: '错误处理',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [650, 700]
});

// 添加成功日志节点
improved.nodes.push({
  parameters: {
    jsCode: `// 记录成功运行日志\nconst runId = $input.first().json.runId || 'unknown';\nconst endTime = new Date().toISOString();\n\nconst successLog = {\n  runId: runId,\n  endTime: endTime,\n  status: 'success',\n  timestamp: endTime\n};\n\nreturn [{\n  json: {\n    message: '分析完成并保存到数据库',\n    log: successLog\n  }\n}];`
  },
  id: 'log-success',
  name: '记录成功日志',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [1250, 450]
});

// 复制原始连接关系
improved.connections = { ...original.connections };

// 添加新的错误分支连接
improved.connections['调用Ollama'] = {
  main: improved.connections['调用Ollama']?.main || [],
  error: [[{ node: '错误处理', type: 'main', index: 0 }]]
};

if (improved.connections['保存到数据库']) {
  improved.connections['保存到数据库'].error = [[{ node: '错误处理', type: 'main', index: 0 }]];
}

fs.writeFileSync('./advanced-workflow-improved.json', JSON.stringify(improved, null, 2), 'utf8');
console.log(`✅ 改进版本已保存: advanced-workflow-improved.json`);
console.log(`节点数: ${improved.nodes.length}`);

try {
  JSON.parse(fs.readFileSync('./advanced-workflow-improved.json', 'utf8'));
  console.log('✅ JSON 格式验证通过');
} catch (e) {
  console.error('❌ JSON 格式验证失败:', e.message);
  process.exit(1);
}

console.log('🎉 完成！');
