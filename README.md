# AutoFlow CN — 中国企业自动化 SaaS 平台

基于 [Activepieces](https://github.com/activepieces/activepieces)（MIT 协议，YC 孵化，16K+ stars）构建的面向中国中小企业的自动化工作流 SaaS 平台。

## 定位

Zapier 中国替代 — 可视化工作流编排 + 中国生态原生集成 + MCP AI Agent 工作流 + 人民币定价 + 私有化部署。

## 核心特性

- **可视化工作流编排**：拖拽式 Builder，Trigger + Action 工作流设计
- **中国生态原生集成**：钉钉/企微/飞书/微信/淘宝/拼多多/抖音电商 Piece
- **支付集成**：支付宝/微信支付原生 Piece
- **MCP AI Agent 工作流**：400+ MCP Server 原生支持，编排 AI 智能体
- **多租户 SaaS**：用户隔离、计费系统、工作流执行配额控制
- **私有化部署**：一键部署脚本，阿里云/腾讯云适配模板
- **人民币定价**：SaaS ¥99/月起，企业版 ¥499/月起

## 本地运行

F1 开发任务提供一个 Activepieces 兼容的本地运行壳，用于验证一键启动、核心工作流执行链路和 Builder 中文化文案。后续接入上游 Activepieces 时，应保持下列健康检查与验证接口兼容。

```bash
# 启动开发环境
docker compose up -d

# 等待服务就绪（约 30 秒）
sleep 30

# 健康检查
curl -s http://localhost:3000/api/v1/health
```

### F1 验证接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/health` | GET | 返回 `{ "status": "ok" }`，用于 Docker Compose 健康检查 |
| `/api/v1/workflows/webhook-http` | POST | 创建 Webhook Trigger + HTTP Request Action 示例工作流 |
| `/api/v1/workflows/:id/trigger` | POST | 触发示例工作流并写入执行记录 |
| `/api/v1/executions/:id` | GET | 查询执行状态，成功时为 `SUCCEEDED` |
| `/api/v1/i18n/builder` | GET | 返回 Builder 中文界面文案和错误消息 |

### F2 钉钉与企业微信 Piece 验证接口

F2 新增钉钉和企业微信两个中国生态 Piece MVP，使用协议稳定的本地 mock HTTP server 覆盖外部开放平台调用。mock 覆盖范围为机器人 Webhook 消息发送请求体、请求头、HTTP 成功/失败响应；真实钉钉/企业微信开放平台鉴权、审批流回调和客户联系 API 留到后续真实凭证验收。

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/pieces` | GET | 返回可被 Activepieces 加载的 Piece 清单，包含 `dingtalk` 与 `wechat-work` |
| `/api/v1/workflows/webhook-piece` | POST | 创建 Webhook Trigger → 钉钉/企业微信发送消息 Action 工作流 |
| `/api/v1/pieces/dingtalk/actions/send-message` | POST | 直接执行钉钉发送文本消息 Action |
| `/api/v1/pieces/wechat-work/actions/send-message` | POST | 直接执行企业微信发送文本消息 Action |

### 测试

```bash
pnpm install
pnpm test -- --runInBand
pnpm run test:pieces -- --filter dingtalk --filter wechat-work
```

完整验收命令：

```bash
docker compose up -d && sleep 30 && curl -s http://localhost:3000/api/v1/health | grep -o ok && pnpm test -- --runInBand
```

## 技术架构文档

- [TECH_STACK.md](docs/TECH_STACK.md) — 技术栈选型、版本、依赖关系
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — 系统架构、模块划分、数据流
- [TEST_CASES.md](docs/TEST_CASES.md) — 全局测试案例框架

## 协议

- Activepieces 上游：MIT License
- AutoFlow CN 自研 Piece 和 SaaS 层：MIT License
