# ARCHITECTURE — AutoFlow CN 系统架构

## 1. 系统概览

AutoFlow CN 由三层架构组成：

1. **SaaS 管理控制台层** — 用户注册、租户管理、计费系统、配额控制
2. **Activepieces 核心引擎层** — 工作流编排、执行、Piece 运行时
3. **数据与基础设施层** — PostgreSQL、Redis、反向代理、监控

```
                    ┌─────────────────────────┐
                    │    用户/管理员浏览器       │
                    └────────┬────────────────┘
                             │ HTTPS
               ┌─────────────▼─────────────┐
               │      Nginx 反向代理        │
               │  TLS + 路由 + 静态资源      │
               └───┬──────────────┬────────┘
                   │              │
        ┌──────────▼──┐    ┌─────▼────────────┐
        │ SaaS 控制台  │    │ Activepieces     │
        │ (Next.js)   │    │ (API + Worker)   │
        │ tRPC/REST   │    │ WebSocket Gateway│
        └──────┬──────┘    └─────┬────────────┘
               │                 │
    ┌──────────▼─────────────────▼────────────┐
    │              数据层                       │
    │  ┌──────────────┐  ┌─────────────────┐  │
    │  │ PostgreSQL   │  │ Redis           │  │
    │  │ (多租户隔离)  │  │ (缓存+队列+会话) │  │
    │  └──────────────┘  └─────────────────┘  │
    └─────────────────────────────────────────┘
```

## 2. 模块划分

### 2.1 SaaS 管理控制台 (`saas-console/`)

```
saas-console/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证路由组
│   │   ├── login/page.tsx        # 登录页
│   │   ├── register/page.tsx     # 注册页
│   │   └── callback/page.tsx     # OAuth 回调（支付宝/微信）
│   ├── (dashboard)/              # 已认证路由组
│   │   ├── layout.tsx            # 侧边栏 + 顶部导航
│   │   ├── page.tsx              # 仪表盘（配额概览）
│   │   ├── workflows/            # 工作流管理
│   │   ├── billing/              # 计费管理
│   │   ├── settings/             # 租户设置
│   │   └── usage/                # 用量统计
│   └── api/                      # API Routes（支付回调等）
├── trpc/                         # tRPC 路由定义
│   ├── router.ts                 # 根路由
│   ├── auth.ts                   # 认证路由
│   ├── tenant.ts                 # 租户管理
│   ├── billing.ts                # 计费管理
│   ├── workflow-quota.ts         # 配额控制
│   └── integration.ts            # 集成管理
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 组件
│   ├── dashboard/                # 仪表盘组件
│   ├── billing/                  # 计费组件
│   └── workflows/                # 工作流管理组件
├── lib/
│   ├── auth.ts                   # 认证逻辑（JWT）
│   ├── prisma.ts                 # Prisma 客户端
│   ├── quota.ts                  # 配额计算
│   ├── payments/
│   │   ├── alipay.ts             # 支付宝集成
│   │   └── wechat.ts             # 微信支付集成
│   └── i18n.ts                   # 国际化
└── prisma/
    ├── schema.prisma             # 数据模型
    └── migrations/               # 数据库迁移
```

### 2.2 Activepieces 核心集成 (`activepieces-integration/`)

```
activepieces-integration/
├── docker-compose.yml            # 上游服务编排
├── activepieces.override.yml     # 自定义配置覆盖
├── patches/                      # 上游补丁（如有）
└── config/
    ├── ap-config.yml             # Activepieces 配置
    └── piece-config.yml          # Piece 加载配置
```

### 2.3 自研中国生态 Piece (`pieces/`)

```
pieces/
├── packages/
│   ├── piece-dingtalk/           # 钉钉集成
│   │   ├── src/
│   │   │   ├── index.ts          # Piece 入口
│   │   │   ├── triggers/
│   │   │   │   ├── on-bot-event.ts   # 机器人事件 Trigger
│   │   │   │   └── on-approval.ts    # 审批事件 Trigger
│   │   │   ├── actions/
│   │   │   │   ├── send-message.ts   # 发送消息
│   │   │   │   ├── push-card.ts      # 推送卡片消息
│   │   │   │   └── create-task.ts    # 创建待办
│   │   │   ├── lib/
│   │   │   │   ├── client.ts         # 钉钉 API 客户端
│   │   │   │   └── types.ts          # 类型定义
│   │   │   └── common/
│   │   │       └── props.ts          # 共享属性（AppId 等）
│   │   └── package.json
│   ├── piece-wechat-work/        # 企业微信集成
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── triggers/
│   │   │   │   ├── on-customer-msg.ts  # 客户消息
│   │   │   │   └── on-webhook.ts       # 群机器人
│   │   │   ├── actions/
│   │   │   │   ├── send-message.ts
│   │   │   │   └── send-group-msg.ts
│   │   │   ├── lib/
│   │   │   └── common/
│   │   └── package.json
│   ├── piece-feishu/             # 飞书集成
│   ├── piece-wechat-pay/         # 微信支付
│   ├── piece-alipay/             # 支付宝
│   ├── piece-taobao/             # 淘宝/天猫
│   ├── piece-pinduoduo/          # 拼多多
│   ├── piece-douyin/             # 抖音电商
│   └── piece-mcp/                # MCP Server 集成
├── package.json                  # monorepo 根配置
├── tsconfig.base.json            # 基础 TypeScript 配置
└── scripts/
    └── build-pieces.sh           # Piece 构建脚本
```

### 2.4 部署与运维 (`deploy/`)

```
deploy/
├── saas/                         # SaaS 托管部署
│   ├── docker-compose.prod.yml   # 生产编排
│   ├── nginx/
│   │   └── autoflow.conf         # Nginx 配置
│   ├── monitoring/
│   │   └── healthcheck.sh        # 健康检查脚本
│   └── backups/
│       └── backup.sh             # 数据库备份
├── self-hosted/                  # 私有化部署
│   ├── install.sh                # 一键安装脚本
│   ├── docker-compose.selfhost.yml
│   ├── aliyun/                   # 阿里云适配
│   │   └── terraform/
│   └── tencent-cloud/            # 腾讯云适配
│       └── terraform/
└── ci-cd/
    ├── github-actions/
    │   ├── build.yml             # 构建流水线
    │   ├── test.yml              # 测试流水线
    │   └── deploy.yml            # 部署流水线
    └── Dockerfile.saas-console   # SaaS 控制台镜像
```

### 2.5 SaaS 多租户数据模型

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Tenant     │     │   Subscription   │     │   UsageRecord    │
├──────────────┤     ├──────────────────┤     ├──────────────────┤
│ id (UUID)    │◄────│ id (UUID)        │     │ id (UUID)        │
│ name         │     │ tenant_id (FK)   │────►│ tenant_id (FK)   │
│ subdomain    │     │ plan_id          │     │ execution_count  │
│ status       │     │ status           │     │ workflow_runs    │
│ created_at   │     │ expires_at       │     │ piece_calls      │
│ settings     │     │ payment_method   │     │ period_start/end │
└──────────────┘     └──────────────────┘     └──────────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   User       │     │   Workflow       │     │   Integration    │
├──────────────┤     ├──────────────────┤     ├──────────────────┤
│ id (UUID)    │     │ id (UUID)        │     │ id (UUID)        │
│ tenant_id    │     │ tenant_id (FK)   │     │ tenant_id (FK)   │
│ email        │     │ name             │     │ piece_name       │
│ role         │     │ status           │     │ config (JSONB)   │
│ created_at   │     │ trigger/action   │     │ credentials      │
└──────────────┘     │ quota_limit      │     │ status           │
                     │ execution_count  │     └──────────────────┘
                     └──────────────────┘
```

## 3. 数据流

### 3.1 工作流执行流

```
用户操作 (SaaS Console)
    │
    ├─ 创建/编辑工作流 → tRPC API → Activepieces API
    │
    ├─ 触发工作流执行
    │   │
    │   ├─ Trigger 触发 (Webhook/定时/事件)
    │   │   │
    │   │   ▼
    │   │   Activepieces Worker 获取工作流定义
    │   │   │
    │   │   ▼
    │   │   逐步执行 Actions
    │   │   │
    │   │   ├─ 调用中国生态 Piece (钉钉/企微/飞书/微信/淘宝/拼多多/抖音)
    │   │   │   │
    │   │   │   ▼
    │   │   │   对应平台 OpenAPI
    │   │   │
    │   │   ├─ 调用 MCP Server (AI Agent 工具)
    │   │   │   │
    │   │   │   ▼
    │   │   │   MCP Protocol → LLM Server
    │   │   │
    │   │   └─ 调用内置 Piece (300+)
    │   │       │
    │   │       ▼
    │   │       对应平台 API
    │   │
    │   ▼
    │   执行结果 → PostgreSQL (execution_logs)
    │
    └─ 用户查看执行结果 ← SaaS Console 查询日志
```

### 3.2 计费与配额控制流

```
定时任务 (每 5 分钟)
    │
    ▼
读取 UsageRecord → 计算当前周期用量
    │
    ├─ 未超配额 → 正常工作流执行
    │
    └─ 超配额
        │
        ├─ 警告通知 (钉钉/企微/邮件)
        │
        └─ 暂停工作流执行
            │
            ▼
        用户升级套餐 → 支付宝/微信支付
            │
            ▼
        支付回调 → 更新 Subscription → 恢复配额
```

## 4. 关键接口

### 4.1 SaaS API (tRPC)

| 路由 | 方法 | 说明 |
|------|------|------|
| `auth.register` | mutation | 租户注册 |
| `auth.login` | mutation | 租户登录 |
| `tenant.get` | query | 获取租户信息 |
| `tenant.update` | mutation | 更新租户设置 |
| `billing.getPlan` | query | 获取当前套餐 |
| `billing.upgrade` | mutation | 升级套餐（创建支付订单） |
| `billing.getUsage` | query | 获取用量统计 |
| `quota.check` | query | 检查配额状态 |
| `integration.list` | query | 列出已配置集成 |
| `integration.connect` | mutation | 配置集成凭证 |

### 4.2 Activepieces API 代理

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/workflows` | GET/POST | 工作流 CRUD |
| `/api/v1/workflows/:id/run` | POST | 手动触发执行 |
| `/api/v1/executions` | GET | 查询执行记录 |
| `/api/v1/pieces` | GET | 列出可用 Piece |

### 4.3 支付回调

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/payment/alipay/notify` | POST | 支付宝异步通知 |
| `/api/payment/wechat/notify` | POST | 微信支付异步通知 |

## 5. 安全设计

- **多租户隔离**：PostgreSQL Row-Level Security + tenant_id 索引
- **API 认证**：JWT + HttpOnly Cookie
- **支付凭证**：加密存储 (AES-256-GCM)
- **传输加密**：全链路 HTTPS
- **配额控制**：Redis 计数器 + 原子操作，防止超额执行

## 6. MVP 优先级

| 优先级 | 模块 | 说明 |
|--------|------|------|
| P0 | Activepieces Docker Compose | 上游核心，一切基础 |
| P0 | SaaS 控制台骨架 | 注册/登录/仪表盘 |
| P0 | 钉钉 Piece | 最高频中国生态集成 |
| P1 | 企业微信 Piece | 第二高频集成 |
| P1 | 多租户数据模型 | Prisma schema + RLS |
| P1 | 配额控制 | Redis 计数器 |
| P2 | 支付宝/微信支付 Piece | 支付集成 |
| P2 | 飞书 Piece | 第三高频集成 |
| P2 | 计费系统 | 套餐管理 + 支付回调 |
| P3 | 淘宝/拼多多/抖音 Piece | 电商集成 |
| P3 | MCP Server 集成 | AI Agent 工作流 |
| P3 | 私有化部署脚本 | 一键部署 |
