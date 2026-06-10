import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import { builderZh } from './i18n/builder-zh.js';
import { runWebhookHttpWorkflow } from './workflow-runner.js';
import { WorkflowStore } from './workflow-store.js';

export interface BuildServerOptions {
  logger?: boolean;
  store?: WorkflowStore;
}

export function buildServer(options: BuildServerOptions = {}): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const store = options.store ?? new WorkflowStore();

  app.register(cors, { origin: true });

  app.get('/api/v1/health', async () => ({
    status: 'ok',
    service: 'autoflow-cn',
    activepiecesCompatible: true,
  }));

  app.post<{
    Body: {
      actionUrl?: string;
    };
  }>('/api/v1/workflows/webhook-http', async (request, reply) => {
    const actionUrl = request.body?.actionUrl ?? 'mock://autoflow-cn/success';

    if (!actionUrl) {
      return reply.code(400).send({
        code: 'MISSING_ACTION_URL',
        message: builderZh.errors.missingActionUrl,
      });
    }

    return reply.code(201).send({ workflow: store.createWebhookHttpWorkflow(actionUrl) });
  });

  app.post<{
    Params: {
      id: string;
    };
    Body: unknown;
  }>('/api/v1/workflows/:id/trigger', async (request, reply) => {
    const workflow = store.getWorkflow(request.params.id);

    if (!workflow) {
      return reply.code(404).send({
        code: 'WORKFLOW_NOT_FOUND',
        message: builderZh.errors.workflowNotFound,
      });
    }

    const execution = await runWebhookHttpWorkflow(store, workflow, request.body ?? {});
    return reply.code(202).send({ execution });
  });

  app.get<{
    Params: {
      id: string;
    };
  }>('/api/v1/executions/:id', async (request, reply) => {
    const execution = store.getExecution(request.params.id);

    if (!execution) {
      return reply.code(404).send({
        code: 'EXECUTION_NOT_FOUND',
        message: '未找到执行记录',
      });
    }

    return { execution };
  });

  app.get('/api/v1/i18n/builder', async () => builderZh);

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '0.0.0.0';
  const app = buildServer({ logger: true });

  app.listen({ port, host }).catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
}
