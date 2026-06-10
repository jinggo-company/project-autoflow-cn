import { describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildServer } from '../server.js';

interface ReceivedRequest {
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}

async function listenOnSafePort(app: FastifyInstance): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const port = 31000 + Math.floor(Math.random() * 8000);
    try {
      await app.listen({ port, host: '127.0.0.1' });
      return `http://127.0.0.1:${port}`;
    } catch (error) {
      if (attempt === 19) {
        throw error;
      }
    }
  }

  throw new Error('测试服务启动失败');
}

async function withServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  const app = buildServer();
  const baseUrl = await listenOnSafePort(app);

  try {
    return await run(baseUrl);
  } finally {
    await app.close();
  }
}

async function withMockProvider<T>(run: (url: string, received: ReceivedRequest[]) => Promise<T>): Promise<T> {
  const received: ReceivedRequest[] = [];
  const provider = buildServer();

  provider.post('/mock/provider', async (request) => {
    received.push({ headers: request.headers, body: request.body });
    return { errcode: 0, errmsg: 'ok' };
  });

  const baseUrl = await listenOnSafePort(provider);

  try {
    return await run(`${baseUrl}/mock/provider`, received);
  } finally {
    await provider.close();
  }
}

describe('T-2026-00286 F2 DingTalk and WeCom pieces', () => {
  it('lists DingTalk and WeChat Work pieces for Activepieces loading', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/pieces`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.pieces).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'dingtalk', actions: ['sendTextMessage'] }),
          expect.objectContaining({ name: 'wechat-work', actions: ['sendTextMessage'] }),
        ]),
      );
    });
  });

  it('TC-004 sends a DingTalk text message from a webhook workflow to mock HTTP server', async () => {
    await withServer(async (baseUrl) => {
      await withMockProvider(async (mockUrl, received) => {
        const createResponse = await fetch(`${baseUrl}/api/v1/workflows/webhook-piece`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            piece: 'dingtalk',
            webhookUrl: mockUrl,
            message: '订单 1001 已创建',
            atMobiles: ['13800000000'],
          }),
        });
        const createBody = await createResponse.json();

        expect(createResponse.status).toBe(201);
        expect(createBody.workflow.action.piece).toBe('dingtalk');

        const triggerResponse = await fetch(`${baseUrl}/api/v1/workflows/${createBody.workflow.id}/trigger`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ orderId: '1001' }),
        });
        const triggerBody = await triggerResponse.json();

        expect(triggerResponse.status).toBe(202);
        expect(triggerBody.execution.status).toBe('SUCCEEDED');
        expect(triggerBody.execution.output.piece).toBe('dingtalk');
        expect(received).toHaveLength(1);
        expect(received[0].headers['x-autoflow-piece']).toBe('dingtalk');
        expect(received[0].body).toEqual({
          msgtype: 'text',
          text: { content: '订单 1001 已创建' },
          at: { atMobiles: ['13800000000'], isAtAll: false },
        });
      });
    });
  });

  it('TC-005 sends a WeChat Work text message from a webhook workflow to mock HTTP server', async () => {
    await withServer(async (baseUrl) => {
      await withMockProvider(async (mockUrl, received) => {
        const createResponse = await fetch(`${baseUrl}/api/v1/workflows/webhook-piece`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            piece: 'wechat-work',
            webhookUrl: mockUrl,
            message: '库存预警：SKU-9 剩余 3 件',
            atMobiles: ['13900000000'],
          }),
        });
        const createBody = await createResponse.json();

        expect(createResponse.status).toBe(201);
        expect(createBody.workflow.action.piece).toBe('wechat-work');

        const triggerResponse = await fetch(`${baseUrl}/api/v1/workflows/${createBody.workflow.id}/trigger`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sku: 'SKU-9' }),
        });
        const triggerBody = await triggerResponse.json();

        expect(triggerResponse.status).toBe(202);
        expect(triggerBody.execution.status).toBe('SUCCEEDED');
        expect(triggerBody.execution.output.piece).toBe('wechat-work');
        expect(received).toHaveLength(1);
        expect(received[0].headers['x-autoflow-piece']).toBe('wechat-work');
        expect(received[0].body).toEqual({
          msgtype: 'text',
          text: {
            content: '库存预警：SKU-9 剩余 3 件',
            mentioned_mobile_list: ['13900000000'],
          },
        });
      });
    });
  });
});
