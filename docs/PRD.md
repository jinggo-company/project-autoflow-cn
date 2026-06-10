# PRD — AutoFlow CN F1

## 背景

AutoFlow CN 基于 Activepieces 构建面向中国企业的自动化工作流平台。F1 先交付一个 Activepieces 兼容的本地验证壳，用于锁定后续接入上游 Activepieces 时必须保持的部署、工作流执行和中文化验收契约。

## 范围

本 PRD 覆盖 T-2026-00285 的 F1 业务验收范围：Docker Compose 一键启动、健康检查、Webhook Trigger + HTTP Request Action 示例工作流、Builder 中文文案、中文错误消息/异常工作流触发。

不在本次范围内：钉钉/企微/飞书/电商/支付 Piece、多租户计费、生产级 PostgreSQL/Redis 持久化、上游 Activepieces 完整镜像替换。

## 验收标准

### AC-1 Docker Compose 一键启动

在项目根目录执行 `docker compose up -d` 后，服务应在约 30 秒内启动并保持健康状态，默认通过 `3000:3000` 暴露本地 API。容器启动不得依赖外部公网服务或人工配置。

### AC-2 健康检查返回 ok

服务启动后，`GET /api/v1/health` 必须返回 HTTP 200，响应 JSON 必须包含 `status: "ok"`。验收命令 `curl -s http://localhost:3000/api/v1/health | grep -o ok` 必须输出 `ok`。

### AC-3 Webhook Trigger + HTTP Request Action 工作流成功执行

系统必须提供 F1 示例工作流接口，支持创建 Webhook Trigger + HTTP Request Action 工作流、触发该工作流并查询执行记录。通过 `POST /api/v1/workflows/webhook-http` 创建、`POST /api/v1/workflows/:id/trigger` 触发、`GET /api/v1/executions/:id` 查询后，执行状态必须为 `SUCCEEDED`。

### AC-4 Builder 中文文案

`GET /api/v1/i18n/builder` 必须返回 Builder 关键界面中文文案，至少包含工作流构建器、选择触发器、添加动作、发布工作流等用于后续前端或上游补丁复用的中文文本。

### AC-5 中文错误消息与异常工作流触发

异常工作流触发必须返回中文错误消息。至少当调用不存在的工作流触发接口 `POST /api/v1/workflows/not-found/trigger` 时，响应应包含稳定错误码和中文消息，例如 `WORKFLOW_NOT_FOUND` 与 `未找到工作流`。

## 验收映射

| AC | 测试案例 | 自动化/手动验证 |
|---|---|---|
| AC-1 | TC-001 | `docker compose up -d` 后检查容器健康状态 |
| AC-2 | TC-001 | `curl -s http://localhost:3000/api/v1/health | grep -o ok` 与 Vitest health 断言 |
| AC-3 | TC-002 | 创建、触发、查询 Webhook HTTP 示例工作流，执行状态为 `SUCCEEDED` |
| AC-4 | TC-003 | `/api/v1/i18n/builder` 返回 Builder 中文文案 |
| AC-5 | TC-003 | 异常工作流触发返回中文错误消息 |
