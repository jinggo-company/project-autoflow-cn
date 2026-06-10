import { describe, expect, it } from 'vitest';
import { buildServer } from '../server.js';

async function withServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  const app = buildServer();
  await app.listen({ port: 0, host: '127.0.0.1' });
  const address = app.server.address();
  if (!address || typeof address === 'string') {
    throw new Error('测试服务启动失败');
  }

  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await app.close();
  }
}

describe('T-2026-00285 F1 acceptance', () => {
  it('TC-001 returns ok from Activepieces compatible health endpoint', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/health`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('ok');
      expect(body.activepiecesCompatible).toBe(true);
    });
  });

  it('TC-002 creates and runs Webhook Trigger + HTTP Request Action workflow', async () => {
    await withServer(async (baseUrl) => {
      const createResponse = await fetch(`${baseUrl}/api/v1/workflows/webhook-http`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ actionUrl: 'mock://autoflow-cn/success' }),
      });
      const createBody = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createBody.workflow.trigger.type).toBe('WEBHOOK');
      expect(createBody.workflow.action.type).toBe('HTTP_REQUEST');

      const triggerResponse = await fetch(`${baseUrl}/api/v1/workflows/${createBody.workflow.id}/trigger`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ event: 'demo' }),
      });
      const triggerBody = await triggerResponse.json();

      expect(triggerResponse.status).toBe(202);
      expect(triggerBody.execution.status).toBe('SUCCEEDED');

      const executionResponse = await fetch(`${baseUrl}/api/v1/executions/${triggerBody.execution.id}`);
      const executionBody = await executionResponse.json();

      expect(executionResponse.status).toBe(200);
      expect(executionBody.execution.status).toBe('SUCCEEDED');
    });
  });

  it('TC-003 exposes localized Builder labels and error messages in Chinese', async () => {
    await withServer(async (baseUrl) => {
      const i18nResponse = await fetch(`${baseUrl}/api/v1/i18n/builder`);
      const i18nBody = await i18nResponse.json();

      expect(i18nResponse.status).toBe(200);
      expect(i18nBody.screens.builderTitle).toBe('工作流构建器');
      expect(i18nBody.screens.triggerPanel).toBe('选择触发器');
      expect(i18nBody.errors.workflowNotFound).toBe('未找到工作流');
      expect(i18nBody.errors.httpActionFailed).toBe('HTTP 请求动作执行失败');

      const missingWorkflowResponse = await fetch(`${baseUrl}/api/v1/workflows/not-found/trigger`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });
      const missingWorkflowBody = await missingWorkflowResponse.json();

      expect(missingWorkflowResponse.status).toBe(404);
      expect(missingWorkflowBody.message).toBe('未找到工作流');
    });
  });
});
