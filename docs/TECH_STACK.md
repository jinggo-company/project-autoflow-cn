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

## 依赖关系

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
