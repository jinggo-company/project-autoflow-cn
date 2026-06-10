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
