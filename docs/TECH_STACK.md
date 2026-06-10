# TECH_STACK — AutoFlow CN 技术栈

## 上游技术栈（Activepieces）

| 组件 | 版本 | 说明 |
|------|------|------|
| Activepieces | 0.48.x（锁定） | 上游核心，MIT 协议，TypeScript 全栈 |
| Node.js | 20.x LTS | 运行时，与 Activepieces 对齐 |
| PostgreSQL | 15.x | 主数据库，工作流定义/执行记录/租户数据 |
| Redis | 7.x | 缓存 + 消息队列 + 会话管理 |
| Docker | 24.x+ | 容器化部署 |
| Docker Compose | 2.24.x+ | 本地开发 & 私有化部署编排 |

## 自研 SaaS 层技术栈

| 组件 | 版本 | 说明 |
|------|------|------|
| Next.js | 14.x (App Router) | SaaS 前端框架，SSR + API Routes |
| React | 18.x | UI 组件库 |
| TypeScript | 5.x | 全栈类型安全 |
| TailwindCSS | 3.x | 原子化 CSS |
| shadcn/ui | latest | 可访问组件库 |
| Prisma | 5.x | ORM，多租户数据隔离 |
| tRPC | 10.x | 类型安全的 API 层（SaaS 管理后台） |

## 自研 Piece 技术栈

| 组件 | 版本 | 说明 |
|------|------|------|
| @activepieces/pieces-framework | 上游对齐 | Piece 开发框架 |
| axios | 1.7.x | HTTP 客户端（API 调用） |
| zod | 3.x | 运行时类型验证（API 参数/响应） |

## 基础设施 & 运维

| 组件 | 版本 | 说明 |
|------|------|------|
| Nginx | 1.25.x | 反向代理 + 静态资源 |
| Let's Encrypt | certbot | TLS 证书自动续期 |
| PM2 | 5.x | Node.js 进程管理（私有化部署备选） |
| GitHub Actions | latest | CI/CD |

## 支付集成

| 组件 | 说明 |
|------|------|
| 支付宝 OpenAPI | 当面付 + 电脑网站支付 + 订阅 |
| 微信支付 API v3 | JSAPI + Native + H5 支付 + 代扣 |

## MCP Server 集成

| 组件 | 说明 |
|------|------|
| Model Context Protocol SDK | TypeScript 实现，MCP 协议适配 |
| 官方 MCP Server 列表 | 上游社区维护，400+ Server |

## F1 本地部署与中文化实现栈

本任务先交付 Activepieces 兼容的本地验证壳，确保 Docker Compose、健康检查、基础工作流与中文 Builder 文案可自动化验收；后续再替换为上游 Activepieces 0.48.x 镜像和补丁集。

| 组件 | 版本 | 说明 |
|------|------|------|
| Node.js | 20.x LTS | F1 本地 API 服务运行时 |
| TypeScript | 5.x | 服务与测试类型安全 |
| Fastify | 4.x | 轻量 HTTP API，模拟 Activepieces 验收接口 |
| Vitest | 1.x | TC-001/TC-002/TC-003 自动化测试 |
| Docker Compose | 2.24.x+ | 一键启动本地服务 |
| pnpm | 10.33.0 | 包管理与测试命令，通过 `packageManager` 锁定 |

## F2 钉钉与企业微信 Piece MVP 实现栈

F2 在 F1 本地验证壳上补充可自动化验收的中国生态 Piece 契约。当前不依赖真实外部凭证，使用本地 mock HTTP server 验证发送消息请求体和错误路径；后续接入 `@activepieces/pieces-framework` 时保持 Piece 名称、Action 名称和请求契约稳定。

| 组件 | 版本 | 说明 |
|------|------|------|
| Fastify | 4.x | 暴露 Piece 清单、Action 执行和 Webhook → Piece 工作流 API |
| TypeScript | 5.x | Piece 类型、请求体构造和执行器类型安全 |
| Vitest | 1.x | TC-004/TC-005 自动化测试，内嵌 mock provider |
| fetch API | Node.js 20 内置 | 向钉钉/企业微信 Webhook 或 mock server 发送 JSON 请求 |

### F2 兼容边界

- Piece 清单必须通过 `/api/v1/pieces` 暴露 `dingtalk` 和 `wechat-work`，便于 Activepieces 加载检查。
- 钉钉 Action 固定为 `sendTextMessage`，发送 `msgtype=text`、`text.content`、`at.atMobiles`、`at.isAtAll=false`。
- 企业微信 Action 固定为 `sendTextMessage`，发送 `msgtype=text`、`text.content`、`text.mentioned_mobile_list`。
- mock 覆盖 HTTP 请求体、`x-autoflow-piece` 请求头、成功响应；真实平台 token、签名、审批流/客户联系事件不在 F2 范围内。

```
┌───────────────────────────────────────────────────┐
│                   SaaS 管理后台                     │
│    Next.js + React + TailwindCSS + shadcn/ui       │
│         tRPC API + Prisma ORM                      │
└──────────────┬────────────────────────────────────┘
               │ HTTP/gRPC
┌──────────────▼────────────────────────────────────┐
│             Activepieces 核心服务                    │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  API Server│  │ Websocket  │  │  Worker       │  │
│  │  (TypeScript)│ │  Gateway   │  │  (Flow Runner)│  │
│  └─────┬──────┘  └────────────┘  └──────┬───────┘  │
│        │                                 │          │
│  ┌─────▼────────────────────────────────▼──────┐  │
│  │              Piece Engine                    │  │
│  │  ┌─────────┐ ┌─────────┐ ┌───────────────┐  │  │
│  │  │ 内置    │ │ 中国生态 │ │ MCP Server    │  │  │
│  │  │ 300+    │ │ 自研    │ │ 400+          │  │  │
│  │  │ Pieces  │ │ Pieces  │ │ 集成          │  │  │
│  │  └─────────┘ └─────────┘ └───────────────┘  │  │
│  └──────────────────────────────────────────────┘  │
└──────────────┬─────────────────────────────────────┘
               │
     ┌─────────▼──────────┐
     │   PostgreSQL 15    │  ← 工作流定义/执行记录/租户
     └────────────────────┘
     │
     ┌─────────▼──────────┐
     │     Redis 7        │  ← 缓存/队列/会话
     └────────────────────┘
```
