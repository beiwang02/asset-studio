# 测试设施

## 一键运行

完整 clone（必须保留 Git 历史）中，从仓库根目录运行：

```bash
node tests/run.cjs --output test-suite-verification.json
```

runner 固定 bounded 4 workers、清除 `NODE_OPTIONS`，逐项记录 stdout/stderr/退出码并在结束再次核验生产文件 SHA-256。`tests/suite-manifest.json` 明确每个 CJS 的类别：`current` 直接读取当前源码；`historical` 只通过 `tests/snapshot.cjs` 的局部快照读取批准 Git revision；`helper` 是归一化器/快照基础设施，单独计数，绝不计入业务 passed。新增 CJS 必须加入清单，否则 runner 拒绝执行。

当前设施基线：70 current、30 historical、16 helper；本次完整实际结果由 `test-suite-verification.json` 记录，另有 158/158 JS/CJS/MJS syntax 通过。当前回归包含 `current-oauth-ui.cjs`（OAuth-only、错误态、无 Token fallback/retry/持久化、旧凭据清理、settings/admin）和 `current-read-performance.cjs`（实时 github.js，bounded history=4、分页/重试/rename、并发去重和 stale epoch）。服务器实时契约由 `oauth-server.cjs`、`session-seven-days.cjs`、`oauth-refresh.cjs`、`server-policy.cjs` 覆盖；这些不会切换到历史源码。

`historical` 明确标记退休 Token/旧 UI 或已验收发布契约；它们说明当时 Git revision 的授权行为，不声称当前产品仍支持 Token。过时测试不会通过全局 `fs.readFileSync` monkeypatch 掩盖当前代码。`release-132.cjs` 精确使用 `4885f22`，逆变换到 `bbbc2df`，保留全部 CSS、六文件和拒绝未授权变异断言；无需 workspace 或 `NODE_OPTIONS`。

## 目录约定

- `*.cjs`：manifest 中分类执行的 Node 测试/设施；不可用 helper 执行次数冒充业务测试数。
- `*.js`：浏览器审计函数；须加载测试夹具进行真实 DOM/交互验收。
- `*.html`：测试夹具，不是生产页面。
- `production-freeze.json`：相对 `b41644c` 的生产 tracked 文件哈希冻结，测试设施之外不得修改。

失败必须逐项保留并诊断；不得删断言、宽泛 regex 忽略、跳过文件或宣称全绿。业务源码、README、UI/backend、`.env`、部署和运行容器不属于本设施修改范围。
