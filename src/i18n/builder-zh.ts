export const builderZh = {
  locale: 'zh-CN',
  screens: {
    builderTitle: '工作流构建器',
    triggerPanel: '选择触发器',
    actionPanel: '添加执行动作',
    testRun: '测试运行',
    publish: '发布工作流',
    executionHistory: '执行记录',
  },
  emptyStates: {
    noTrigger: '请先选择一个触发器',
    noAction: '还没有添加执行动作',
  },
  errors: {
    workflowNotFound: '未找到工作流',
    invalidWebhookPayload: 'Webhook 请求内容无效',
    httpActionFailed: 'HTTP 请求动作执行失败',
    missingActionUrl: '请填写 HTTP 请求地址',
  },
} as const;
