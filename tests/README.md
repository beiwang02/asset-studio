# 测试目录

- `*.cjs`：Node 回归测试及其 helpers，可在仓库根目录逐个运行；目前 112 个文件（包含直接执行无断言的 helpers，不能等同于 112 项业务测试）。
- `*.js`：浏览器审计函数，覆盖布局几何、计算样式及交互，不是同名 `.cjs` 的重复副本。
- `*.html`：测试夹具，不用于生产服务。

## Node 回归

```bash
for file in tests/*.cjs; do node "$file" || exit 1; done
```

`overview-no-hero.cjs` 和 `release-132.cjs` 会读取 Git 历史中的已验收文件。请使用完整克隆保留这些历史提交。

`node tests/release-132.cjs` 不需要 `NODE_OPTIONS` 或仓库外 workspace helpers。它验证最终 cache132 批准提交 `4885f22b80fe084a60523b4f6b7986f1128a5646`（含 OAuth state 回收），通过精确授权 JSON 逆变换逐字比较基线 `bbbc2df8de9ed79831438d02f78d7667895d888a`；保留六个文件、全部 CSS 断言和拒绝未授权变异的断言。归一化器不再修改全局 `fs.readFileSync`。这是历史 snapshot，不能用它冻结或回退今天的 README。当前七天会话和 OAuth 行为分别由 `session-seven-days.cjs`、`oauth-server.cjs` 等直接读取实时源码的测试覆盖。

部分其他旧测试仍对当前源码应用历史冻结链；直接运行全矩阵可能报历史授权不匹配。必须保留实际失败，不得用外部 preload、跳过文件或将失败标记为通过。

## 浏览器审计

通过本地测试夹具加载 `.js`；部分脚本提供 `window.audit…` 入口，供浏览器工具动态加载调用。没有静态 HTML 引用不等于已废弃。不要仅凭扩展名或相同文件名删除测试。

Node 回归不替代真实移动端浏览器交互验收。
