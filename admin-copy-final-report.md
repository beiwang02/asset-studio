# Admin Copy Final Report

- Scope: `console.js` admin allowlist help sentence only.
- Copy: `填写允许访问网站的 GitHub 用户名，多个用户名用英文逗号分隔。`
- Removed from the help sentence: `octocat` example and administrator explanation.
- Authorization and policy logic: unchanged.
- Intentionally excluded from commit: `favicon-round-deploy-report.md`, `longpress-deploy-report.md`.
- Deployment scope: `console.js` and `index.html` only; cache bust `163`; build/upload target `assetstudio`.
- Protected on VPS: env, compose, policy, data, and the other six protected paths; no prune, backup, or temp-key cleanup.
- Validation: Node syntax check passed; source diff is one line; release/settings/policy checks passed; public service returned HTTP 200.
- Commit: `65ab0d9` pushed to `origin/main`.
- VPS result: `asset-studio` service rebuilt and restarted; `console.js` SHA-256 `39d01b57ccba9b4b589c501071ea8e15247f27fa64a90f24eed5db88485d63e1`; `index.html` SHA-256 `9d69265bf7f19cb63360bbd26ac9a3ea57e76a41f2130bf80bc6919c5394915d`.
