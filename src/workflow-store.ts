import type { PieceName } from './cn-pieces.js';

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

export interface WebhookPieceWorkflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  trigger: {
    type: 'WEBHOOK';
    path: string;
  };
  action: {
    type: 'PIECE_ACTION';
    piece: PieceName;
    operation: 'sendTextMessage';
    webhookUrl: string;
    message: string;
    title?: string;
    atMobiles?: string[];
  };
  createdAt: string;
}

export type Workflow = WebhookHttpWorkflow | WebhookPieceWorkflow;

export function isWebhookPieceWorkflow(workflow: Workflow): workflow is WebhookPieceWorkflow {
  return workflow.action.type === 'PIECE_ACTION';
}

export function isWebhookHttpWorkflow(workflow: Workflow): workflow is WebhookHttpWorkflow {
  return workflow.action.type === 'HTTP_REQUEST';
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
  private workflows = new Map<string, Workflow>();
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

  createWebhookPieceWorkflow(input: {
    piece: PieceName;
    webhookUrl: string;
    message: string;
    title?: string;
    atMobiles?: string[];
  }): WebhookPieceWorkflow {
    const id = crypto.randomUUID();
    const displayName = input.piece === 'dingtalk' ? '钉钉' : '企业微信';
    const workflow: WebhookPieceWorkflow = {
      id,
      name: `Webhook 到${displayName}消息示例`,
      status: 'ENABLED',
      trigger: {
        type: 'WEBHOOK',
        path: `/webhooks/${id}`,
      },
      action: {
        type: 'PIECE_ACTION',
        piece: input.piece,
        operation: 'sendTextMessage',
        webhookUrl: input.webhookUrl,
        message: input.message,
        title: input.title,
        atMobiles: input.atMobiles,
      },
      createdAt: new Date().toISOString(),
    };

    this.workflows.set(id, workflow);
    return workflow;
  }

  getWorkflow(id: string): Workflow | undefined {
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
