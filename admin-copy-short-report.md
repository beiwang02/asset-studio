# Admin Copy Short Release Report

- Scope: `console.js` admin allowlist help copy only; permission and behavior logic unchanged.
- New copy: `填写 GitHub 用户名（如 octocat），多个用户名用英文逗号分隔。管理员权限独立保留。`
- Cache: `index.html` script revision advanced from `clean-ui-release-161` to `clean-ui-release-162` because `console.js` changed.
- Verification: `node --check console.js` passed; diff is limited to the requested copy and the required cache revision.
- Existing untracked reports `favicon-round-deploy-report.md` and `longpress-deploy-report.md` were left untouched and excluded.
- GitHub push: pending until commit is created.
- VPS upload: blocked in this environment. No `VPS_HOST` or `SSH_KEY_STUDIO` is available, so no SSH attempt was made and no secret was printed.
- Archive: not modified; no safe VPS/archive operation was available without deployment credentials.
