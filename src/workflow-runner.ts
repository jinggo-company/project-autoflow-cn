import { builderZh } from './i18n/builder-zh.js';
import type { WebhookHttpWorkflow, WorkflowExecution, WorkflowStore } from './workflow-store.js';

export async function runWebhookHttpWorkflow(
  store: WorkflowStore,
  workflow: WebhookHttpWorkflow,
  input: unknown,
): Promise<WorkflowExecution> {
  try {
    const response = await dispatchHttpAction(workflow.action.url, input);
    return store.saveExecution({
      id: crypto.randomUUID(),
      workflowId: workflow.id,
      status: 'SUCCEEDED',
      input,
      output: response,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    return store.saveExecution({
      id: crypto.randomUUID(),
      workflowId: workflow.id,
      status: 'FAILED',
      input,
      output: {
        message: error instanceof Error ? error.message : builderZh.errors.httpActionFailed,
      },
      createdAt: new Date().toISOString(),
    });
  }
}

async function dispatchHttpAction(url: string, input: unknown): Promise<unknown> {
  if (url === 'mock://autoflow-cn/success') {
    return {
      ok: true,
      statusCode: 200,
      received: input,
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(input ?? {}),
  });

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(`${builderZh.errors.httpActionFailed}：${response.status}`);
  }

  return {
    ok: true,
    statusCode: response.status,
    body,
  };
}
