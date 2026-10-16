# Admin Copy Final Report

- Scope: `console.js` admin allowlist help sentence only.
- Copy: `填写允许访问网站的 GitHub 用户名，多个用户名用英文逗号分隔。`
- Removed from the help sentence: `octocat` example and administrator explanation.
- Authorization and policy logic: unchanged.
- Intentionally excluded from commit: `favicon-round-deploy-report.md`, `longpress-deploy-report.md`.
- Deployment scope: `console.js` and `index.html` only; cache bust `163`; build/upload target `assetstudio`.
- Protected on VPS: env, compose, policy, data, and the other six protected paths; no prune, backup, or temp-key cleanup.
- Validation: Node syntax check passed; source diff is one line; release/settings/policy checks recorded with deployment result.
