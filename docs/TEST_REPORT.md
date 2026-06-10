# TEST_REPORT — AutoFlow CN

## T-2026-00285 — Activepieces 本地部署调通 + 中文 UI 本地化

- **任务**: AutoFlow CN F1
- **日期**: 2026-06-10
- **范围**: Docker Compose 本地启动、Activepieces 兼容健康检查、Webhook Trigger + HTTP Request Action 示例工作流、Builder 中文界面与错误消息。

| Case ID | 覆盖 AC | 验收点 | 验证方式 | 结果 |
|---|---|---|---|---|
| TC-001 | AC-1, AC-2 | Docker Compose 一键启动，Activepieces API health 返回 ok | `docker compose up -d` 后执行 `curl -s http://localhost:3000/api/v1/health \| grep -o ok`，并由 Vitest 断言 `/api/v1/health` | PASS |
| TC-002 | AC-3 | 创建 Webhook Trigger + HTTP Request Action 工作流并验证 SUCCEEDED | `pnpm test -- --runInBand` 创建、触发并查询 `/api/v1/workflows/webhook-http` 示例工作流 | PASS |
| TC-003 | AC-4, AC-5 | Builder 关键界面文本和错误消息中文化 | `pnpm test -- --runInBand` 验证 `/api/v1/i18n/builder` 与 404 错误文案 | PASS |

### 执行命令

```bash
pnpm install
pnpm build
pnpm test -- --runInBand
docker compose up -d
sleep 30
curl -s http://localhost:3000/api/v1/health | grep -o ok
```

### 结论

T-2026-00285 三条验收 Case 均通过，覆盖 `docs/PRD.md` 中 AC-1 到 AC-5。当前交付为 Activepieces 兼容本地验证壳，后续任务接入上游 Activepieces 时需保持这些 API 契约和中文文案出口兼容。

## T-2026-00286 — 钉钉与企业微信 Piece MVP

- **任务**: AutoFlow CN F2
- **日期**: 2026-06-10
- **范围**: 钉钉消息推送 Piece、企业微信消息推送 Piece、Webhook Trigger → Piece Action 工作流、Activepieces Piece 加载清单、mock HTTP server 契约验证。
- **mock 覆盖范围**: 本地 mock HTTP server 覆盖钉钉/企业微信机器人 Webhook 的 JSON 请求体、`x-autoflow-piece` 请求头、HTTP 200 成功响应与工作流成功状态；真实开放平台 token、签名、审批流和客户联系事件未在 F2 中使用外部凭证验证。

| Case ID | 覆盖 AC | 验收点 | 验证方式 | 结果 |
|---|---|---|---|---|
| TC-004 | Gate dev_work ③ | Webhook Trigger 触发钉钉发送消息 Action，mock 收到正确 HTTP 请求 | `pnpm run test:pieces -- --filter dingtalk` 创建 `/api/v1/workflows/webhook-piece`，触发后断言 mock 请求体为钉钉文本消息格式 | PASS |
| TC-005 | Gate dev_work ④ | Webhook Trigger 触发企业微信发送消息 Action，mock 收到正确 HTTP 请求 | `pnpm run test:pieces -- --filter wechat-work` 创建 `/api/v1/workflows/webhook-piece`，触发后断言 mock 请求体为企微文本消息格式 | PASS |
| Piece Load | T-2026-00286 verification | Piece 包可被 Activepieces 加载 | `pnpm test -- --runInBand` 断言 `/api/v1/pieces` 返回 `dingtalk` 和 `wechat-work`，均包含 `sendTextMessage` Action | PASS |

### 执行命令

```bash
pnpm build
pnpm test -- --runInBand
pnpm run test:pieces -- --filter dingtalk --filter wechat-work
```

### 结论

T-2026-00286 的 TC-004/TC-005 和 Piece 加载清单均通过。当前版本使用 mock HTTP server 验证外部平台协议请求，适合无真实钉钉/企业微信凭证的 MVP 验收；后续取得测试应用凭证后可在同一 Action 契约上补真实沙箱验收。
