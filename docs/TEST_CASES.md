# TEST_CASES — AutoFlow CN 全局测试案例框架

> Case-ID 对应 `docs/PRD.md` 中的 `AC-N` 验收标准。
> 本文档为全局测试框架，具体增量案例随各 T-* 开发任务补充。

## TC-001: Activepieces Docker Compose 启动验证

- **对应 AC**: AC-1 Docker Compose 一键启动；AC-2 健康检查返回 ok
- **适用任务**: T-2026-00285
- **测试步骤**:
  1. 执行 `docker compose up -d`
  2. 等待 30 秒
  3. 执行 `curl -s http://localhost:3000/api/v1/health`
  4. 执行 `pnpm test -- --runInBand` 中的 `TC-001` 自动化断言
- **预期结果**: HTTP 200，响应包含 `"ok"`
- **验证命令**: `curl -s http://localhost:3000/api/v1/health | grep -o ok`

## TC-002: 基础工作流创建与执行

- **对应 AC**: AC-3 Webhook Trigger + HTTP Request Action 工作流成功执行
- **适用任务**: T-2026-00285
- **测试步骤**:
  1. 通过 `POST /api/v1/workflows/webhook-http` 创建 Webhook Trigger + HTTP Request Action 工作流
  2. 通过 `POST /api/v1/workflows/:id/trigger` 触发 Webhook
  3. 通过 `GET /api/v1/executions/:id` 查询执行记录
  4. 执行 `pnpm test -- --runInBand` 中的 `TC-002` 自动化断言
- **预期结果**: 工作流执行状态为 `SUCCEEDED`

## TC-003: 中文 UI 本地化

- **对应 AC**: AC-4 Builder 中文文案；AC-5 中文错误消息与异常工作流触发
- **适用任务**: T-2026-00285
- **测试步骤**:
  1. 启动服务
  2. 访问 `GET /api/v1/i18n/builder`
  3. 检查 Builder 关键界面文本为中文
  4. 触发错误，检查错误消息为中文
  5. 执行 `pnpm test -- --runInBand` 中的 `TC-003` 自动化断言
- **预期结果**: Builder 界面和错误消息均为中文

## TC-004: 钉钉 Piece — 消息推送

- **对应 AC**: Gate G-2026-00091 dev_work ③
- **适用任务**: T-2026-00286
- **mock 契约**:
  - mock server 接收 `POST` JSON 请求。
  - 请求头包含 `x-autoflow-piece: dingtalk`。
  - 请求体固定为钉钉机器人文本消息格式：`msgtype=text`、`text.content`、`at.atMobiles`、`at.isAtAll=false`。
  - mock 返回 `{ "errcode": 0, "errmsg": "ok" }` 表示平台成功。
- **测试步骤**:
  1. 启动本地 API 服务和测试内嵌 mock HTTP server
  2. 通过 `POST /api/v1/workflows/webhook-piece` 创建 Webhook Trigger → 钉钉发送消息 Action 工作流
  3. 触发 Webhook
  4. 验证 mock 收到正确 HTTP 请求
  5. 执行 `pnpm run test:pieces -- --filter dingtalk` 中的 `TC-004` 自动化断言
- **预期结果**: mock server 收到正确钉钉消息推送请求，工作流执行状态为 `SUCCEEDED`

## TC-005: 企业微信 Piece — 消息推送

- **对应 AC**: Gate G-2026-00091 dev_work ④
- **适用任务**: T-2026-00286
- **mock 契约**:
  - mock server 接收 `POST` JSON 请求。
  - 请求头包含 `x-autoflow-piece: wechat-work`。
  - 请求体固定为企业微信群机器人文本消息格式：`msgtype=text`、`text.content`、`text.mentioned_mobile_list`。
  - mock 返回 `{ "errcode": 0, "errmsg": "ok" }` 表示平台成功。
- **测试步骤**:
  1. 启动本地 API 服务和测试内嵌 mock HTTP server
  2. 通过 `POST /api/v1/workflows/webhook-piece` 创建 Webhook Trigger → 企业微信发送消息 Action 工作流
  3. 触发 Webhook
  4. 验证 mock 收到正确 HTTP 请求
  5. 执行 `pnpm run test:pieces -- --filter wechat-work` 中的 `TC-005` 自动化断言
- **预期结果**: mock server 收到正确企业微信消息推送请求，工作流执行状态为 `SUCCEEDED`

## TC-006: 飞书 Piece — 消息推送

- **对应 AC**: Gate G-2026-00091 dev_work ⑤
- **测试步骤**: 同 TC-004/TC-005 模式
- **预期结果**: 飞书收到正确的消息推送

## TC-007: 微信支付/支付宝 Piece — 支付集成

- **对应 AC**: Gate G-2026-00091 dev_work ⑥
- **测试步骤**:
  1. 配置支付宝/微信支付沙箱凭证
  2. 创建包含支付 Action 的工作流
  3. 触发支付流程（沙箱环境）
  4. 验证支付回调处理
- **预期结果**: 支付流程完成，回调正确处理

## TC-008: MCP Server 集成验证

- **对应 AC**: Gate G-2026-00091 dev_work ⑧ / e2e_strategy ③
- **测试步骤**:
  1. 配置 mock MCP Server
  2. 创建"用户提问 → 调用 MCP 工具 → 返回结果"工作流
  3. 触发工作流
  4. 验证端到端流程
- **预期结果**: MCP 工具调用成功，结果正确返回

## TC-009: SaaS 多租户注册与隔离

- **对应 AC**: Gate G-2026-00091 dev_work ⑨
- **测试步骤**:
  1. 注册租户 A，创建工作流
  2. 注册租户 B
  3. 租户 B 登录，验证不可见租户 A 的工作流
- **预期结果**: 租户数据完全隔离

## TC-010: 计费系统 — 套餐订阅

- **对应 AC**: Gate G-2026-00091 dev_work ⑨
- **测试步骤**:
  1. 租户注册（免费版）
  2. 升级到付费套餐（支付宝/微信沙箱）
  3. 验证 Subscription 状态更新
  4. 验证配额提升
- **预期结果**: 支付成功，套餐升级，配额正确提升

## TC-011: 工作流执行配额控制

- **对应 AC**: Gate G-2026-00091 dev_work ⑨
- **测试步骤**:
  1. 设置租户配额为 10 次/月
  2. 连续触发 10 次工作流执行
  3. 第 11 次触发
- **预期结果**: 前 10 次成功，第 11 次被拒绝并返回配额超限错误

## TC-012: 私有化部署一键脚本

- **对应 AC**: Gate G-2026-00091 dev_work ⑩
- **测试步骤**:
  1. 在空白 Ubuntu 服务器上执行 `install.sh`
  2. 验证所有服务启动
  3. 验证健康检查通过
- **预期结果**: 一键部署成功，所有服务正常运行

## TC-013: 阿里云部署模板验证

- **对应 AC**: Gate G-2026-00091 dev_work ⑩
- **测试步骤**:
  1. 使用 Terraform 在阿里云创建资源
  2. 部署 AutoFlow CN
  3. 验证服务可用
- **预期结果**: 阿里云部署成功

## TC-014: 腾讯云部署模板验证

- **对应 AC**: Gate G-2026-00091 dev_work ⑩
- **测试步骤**: 同 TC-013，使用腾讯云
- **预期结果**: 腾讯云部署成功

## TC-015: 淘宝/拼多多/抖音电商 Piece

- **对应 AC**: Gate G-2026-00091 dev_work ⑦
- **测试步骤**:
  1. 配置电商 API 凭证（沙箱/mock）
  2. 创建"订单创建 → 物流追踪"工作流
  3. 触发订单事件
  4. 验证物流信息同步
- **预期结果**: 电商 API 调用成功，数据正确同步
