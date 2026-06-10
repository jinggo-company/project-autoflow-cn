export type WorkflowStatus = 'ENABLED' | 'DISABLED';
export type ExecutionStatus = 'SUCCEEDED' | 'FAILED';

export interface WebhookHttpWorkflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  trigger: {
    type: 'WEBHOOK';
    path: string;
  };
  action: {
    type: 'HTTP_REQUEST';
    method: 'POST';
    url: string;
  };
  createdAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  input: unknown;
  output: unknown;
  createdAt: string;
}

export class WorkflowStore {
  private workflows = new Map<string, WebhookHttpWorkflow>();
  private executions = new Map<string, WorkflowExecution>();

  createWebhookHttpWorkflow(actionUrl: string): WebhookHttpWorkflow {
    const id = crypto.randomUUID();
    const workflow: WebhookHttpWorkflow = {
      id,
      name: 'Webhook 到 HTTP 请求示例',
      status: 'ENABLED',
      trigger: {
        type: 'WEBHOOK',
        path: `/webhooks/${id}`,
      },
      action: {
        type: 'HTTP_REQUEST',
        method: 'POST',
        url: actionUrl,
      },
      createdAt: new Date().toISOString(),
    };

    this.workflows.set(id, workflow);
    return workflow;
  }

  getWorkflow(id: string): WebhookHttpWorkflow | undefined {
    return this.workflows.get(id);
  }

  saveExecution(execution: WorkflowExecution): WorkflowExecution {
    this.executions.set(execution.id, execution);
    return execution;
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id);
  }

  reset(): void {
    this.workflows.clear();
    this.executions.clear();
  }
}
