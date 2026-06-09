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

```bash
# 启动开发环境
docker compose up -d

# 等待服务就绪（约 30 秒）
sleep 30

# 健康检查
curl -s http://localhost:3000/api/v1/health
```

## 技术架构文档

- [TECH_STACK.md](docs/TECH_STACK.md) — 技术栈选型、版本、依赖关系
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — 系统架构、模块划分、数据流
- [TEST_CASES.md](docs/TEST_CASES.md) — 全局测试案例框架

## 协议

- Activepieces 上游：MIT License
- AutoFlow CN 自研 Piece 和 SaaS 层：MIT License
