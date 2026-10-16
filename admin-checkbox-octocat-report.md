# Admin Checkbox / Octocat Verification

日期：2026-10-17

## Scope

- 仅修改管理后台 `允许所有 GitHub 用户` 的 `.policy-toggle` checkbox 视觉。
- 保留原生 `input[type=checkbox]`、`name=allowAll`、label 文案、点击/键盘语义和布局。
- 未修改图片资源、JSON 引用或其他 checkbox。
- 保留线上当前帮助文案：`填写 GitHub 用户名（如 octocat），不是昵称或邮箱；多个用户名用英文逗号分隔。...`

## Changes

- `console.css`: 仅作用于 `.policy-toggle input[type="checkbox"]`，统一为 22px 方框；选中态使用内联 SVG 勾号；保留 `:focus-visible` 键盘焦点提示、disabled 状态和现有主题变量。
- `ui-refresh.css`: 仅补充 dark theme 下该策略 checkbox 的未选中/选中颜色。
- `console.js`: 保留 `octocat` 示例文案；未实施中性文案替换。

## Verification

- `git diff --check`: PASS
- `node tests/release-133.cjs`: PASS（OAuth source authorization regression）
- 直接静态核验：`name="allowAll"`、label 文案、`octocat` 文案存在；中性替换文案不存在。
- 工作树另有既存未跟踪 `favicon-round-deploy-report.md` 与 `longpress-deploy-report.md`，未修改。

## Deployment

本轮未执行 GitHub push、VPS SSH、build/up、cache/archive 或线上 public `console.js` 核验：环境中未提供 `VPS_SSH_KEY`，且没有获得可安全确认的部署凭据/命令。未伪造线上发布结果。
