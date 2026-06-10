export type PieceName = 'dingtalk' | 'wechat-work';

export interface PieceActionInput {
  webhookUrl: string;
  message: string;
  title?: string;
  atMobiles?: string[];
}

export interface PieceActionResult {
  ok: true;
  piece: PieceName;
  statusCode: number;
  providerResponse: unknown;
  request: {
    url: string;
    body: unknown;
  };
}

export interface PieceDefinition {
  name: PieceName;
  displayName: string;
  actions: string[];
  triggers: string[];
}

export const pieceCatalog: PieceDefinition[] = [
  {
    name: 'dingtalk',
    displayName: '钉钉开放平台',
    actions: ['sendTextMessage'],
    triggers: ['botEventWebhook'],
  },
  {
    name: 'wechat-work',
    displayName: '企业微信',
    actions: ['sendTextMessage'],
    triggers: ['groupRobotWebhook'],
  },
];

export async function sendPieceMessage(piece: PieceName, input: PieceActionInput): Promise<PieceActionResult> {
  if (!input.webhookUrl) {
    throw new Error('缺少 Webhook 地址');
  }

  if (!input.message) {
    throw new Error('缺少消息内容');
  }

  const body = buildProviderBody(piece, input);
  const response = await fetch(input.webhookUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-autoflow-piece': piece,
    },
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') ?? '';
  const providerResponse = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(`${displayName(piece)}消息发送失败：${response.status}`);
  }

  return {
    ok: true,
    piece,
    statusCode: response.status,
    providerResponse,
    request: {
      url: input.webhookUrl,
      body,
    },
  };
}

function buildProviderBody(piece: PieceName, input: PieceActionInput): unknown {
  if (piece === 'dingtalk') {
    return {
      msgtype: 'text',
      text: {
        content: input.message,
      },
      at: {
        atMobiles: input.atMobiles ?? [],
        isAtAll: false,
      },
    };
  }

  return {
    msgtype: 'text',
    text: {
      content: input.message,
      mentioned_mobile_list: input.atMobiles ?? [],
    },
  };
}

function displayName(piece: PieceName): string {
  return piece === 'dingtalk' ? '钉钉' : '企业微信';
}
