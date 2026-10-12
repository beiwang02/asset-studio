# Asset Studio

Asset Studio 是一个基于 GitHub 仓库管理图片与 JSON 库的轻量 Web 控制台。图片与 JSON 存放在用户选择的 GitHub 资源仓库，服务端不保存业务资源。

## 功能

- GitHub OAuth 授权登录
- 自动识别兼容结构的图片仓库，也可创建或手动选择仓库
- 管理 JSON 库、图片资源和图片分组
- 上传、改名、删除图片时自动同步 JSON 引用
- 多选图片批量加入 JSON 或批量删除
- GitHub SHA 冲突保护和原子 Git 提交
- 管理员访问名单等可选功能，按需配置
- 深色、浅色、跟随系统三种外观；适配移动端

## 数据流

1. 用户点击 GitHub 登录并在 GitHub 完成 OAuth 授权。
2. 服务端通过内存会话中的 OAuth 授权凭据代理 GitHub API 请求。
3. 图片、JSON、分组和 Git 提交全部写入用户选择的 GitHub 资源仓库。
4. 会话过期、用户退出或服务端重启后需重新授权；会话及其授权凭据不写入数据库或业务文件。

## GitHub OAuth 登录配置

登录前需由部署者创建 GitHub OAuth App 并配置服务器。未配置时，登录按钮会显示配置提示和创建应用的链接；配置完成后点击按钮进入 GitHub 授权页面。

站点登录会话默认最长 **7 天**，从登录时开始固定计时，使用网站不会续期；可通过 `SESSION_TTL_DAYS` 配置为 1–30 的整数天。GitHub 返回刷新凭据时，服务端会在内存中自动更新临近到期的授权凭据，但不会延长站点会话。会话到期、主动退出、服务重启，或 GitHub 授权撤销／凭据失效且无法刷新时，需重新 GitHub 登录。

七天指登录会话，不是资源保存期限；仓库资源不会因此删除。授权凭据不写入浏览器、数据库或业务文件，也不保证 GitHub 凭据本身可用七天。

### 1. 创建 OAuth App

打开 [GitHub OAuth App 创建页面](https://github.com/settings/applications/new)，填写：

| 字段 | 必填 / 选填 | 填写内容 |
| --- | --- | --- |
| Application name | 必填 | 自定义应用名称，例如 `Asset Studio` |
| Homepage URL | 必填 | 网站实际对外访问地址，例如 `https://your-domain.example` |
| Application description | 选填 | 应用说明，可留空 |
| Redirect URI | 必填 | `https://your-domain.example/api/auth/github/callback`，替换为实际域名，保留固定路径，不使用通配符（旧界面称 Authorization callback URL） |

**Expire user access tokens：推荐勾选。** 本项目支持自动刷新到期的授权凭据，可限制单个访问凭据的有效时间。自动刷新不会延长站点的七天会话。

点击 **Register application**。创建完成后，在应用页面复制 **Client ID**，再点击 **Generate a new client secret** 生成并复制 **Client Secret**，接着填写到下一步的服务器配置中。

本文的 `https://your-domain.example` 仅为占位示例，必须全部替换为真实部署网址。OAuth 登录需要浏览器可访问且地址一致的 HTTPS 网站；回调地址必须与网站同源，路径保持 `/api/auth/github/callback`。

### 2. 填写服务器配置

在部署服务器上编辑 `/opt/stacks/asset-studio/.env`：

```bash
cd /opt/stacks/asset-studio
nano .env
```

仅在服务器 `.env` 中修改以下对应项（保留其他已有配置）：`PUBLIC_BASE_URL` 必填真实对外网站地址，`GITHUB_CLIENT_ID` 与 `GITHUB_CLIENT_SECRET` 必填；`GITHUB_OAUTH_SCOPE` 可保留默认 `public_repo`；`GITHUB_OAUTH_REDIRECT_URI` 选填，可留空自动推导。

```dotenv
PUBLIC_BASE_URL=https://your-domain.example
GITHUB_CLIENT_ID=填写刚复制的ClientID
GITHUB_CLIENT_SECRET=填写刚生成的ClientSecret
GITHUB_OAUTH_SCOPE=public_repo
GITHUB_OAUTH_REDIRECT_URI=https://your-domain.example/api/auth/github/callback
```

`GITHUB_OAUTH_REDIRECT_URI` 也可留空，由 `PUBLIC_BASE_URL` 自动推导上述回调地址；若显式填写，必须与 GitHub OAuth App 中的回调地址完全一致，并与 `PUBLIC_BASE_URL` 同源（协议、主机、端口一致），路径固定为 `/api/auth/github/callback`，不附加查询参数或片段。`public_repo` 授权范围涵盖账号可访问的公开仓库，**并非仅授权所选的一个仓库**；组织策略仍可能限制访问。

Client Secret 只填服务器 `.env`，不要发给别人、上传 Git 或放进公开归档、截图。

### 3. 应用配置并登录

保存 `.env` 后，在部署目录执行：

```bash
cd /opt/stacks/asset-studio
docker compose up -d --no-deps --force-recreate asset-studio
```

这一步让容器重新读取环境配置；普通 `docker compose restart` 不会重新加载 `.env`。仅修改这些配置不需要构建镜像。

> **绑定或更换域名时：** 必须同时修改 GitHub OAuth App 的 **Homepage URL**、**Redirect URI（旧界面称 Authorization callback URL）**，以及服务器 `.env` 的 **PUBLIC_BASE_URL**；若 **GITHUB_OAUTH_REDIRECT_URI** 已显式填写，也要同步修改（留空则自动推导）。例如从 `https://old-domain.example` 改为 `https://your-domain.example`，Homepage URL 与 PUBLIC_BASE_URL 均改为新网站地址，回调地址改为 `https://your-domain.example/api/auth/github/callback`；若实际对外 URL 含非默认端口，以上地址须保留相同协议、主机和端口。保存后执行上面的 `docker compose up -d --no-deps --force-recreate asset-studio` 使环境变量生效。原先用 IP 地址访问、后来绑定域名时也一样，不能只改 DNS 而忘记更新 OAuth 配置。

刷新网站 → 点击 **GitHub 登录** → 在 GitHub 核对应用并批准授权 → 返回网站后选择或创建自己的图片资源仓库，即可开始使用。

可在 GitHub **Settings → Applications → Authorized OAuth Apps** 撤销授权。取消授权或授权失败会返回登录页。

## 资源仓库结构

项目兼容已有的 `assets/` 或 `icons/` 图片目录，并读取所有包含 `icons` 数组的 JSON 文件。新建资源时建议使用下面的结构：

```text
assets/
  emby/
    netflix.png
    iris.png
json/
  library.json
```

`json/library.json` 示例：

```json
{
  "name": "我的 JSON 库",
  "description": "常用图片",
  "icons": [
    {
      "name": "Netflix",
      "url": "https://raw.githubusercontent.com/owner/repo/main/assets/emby/netflix.png"
    }
  ]
}
```

## 部署

默认访问端口为 `8765`（可修改 `.env` 中的 `GITHUB_IMAGE_HOST_PORT`）。部署成功后访问：

```text
http://服务器IP:8765
```

### 步骤 1：安装 Docker

已安装 Docker 和 Compose 的服务器可跳过这一步。

```bash
curl -fsSL https://get.docker.com | sh
```

### 步骤 2：Docker Compose 部署

以下命令在服务器的 root 终端执行，部署目录固定为 `/opt/stacks/asset-studio/`。

```bash
mkdir -p /opt/stacks
git clone https://github.com/beiwang02/asset-studio.git /opt/stacks/asset-studio && cd /opt/stacks/asset-studio && cp .env.example .env && docker compose up -d --build
```

常用命令（先进入部署目录；更新时不要再次执行 `cp .env.example .env`，以免覆盖配置）：

```bash
cd /opt/stacks/asset-studio
# 查看状态
docker compose ps
# 查看日志
docker compose logs -f asset-studio
# 更新版本
git pull --ff-only
docker compose up -d --build
```

> 自动化脚本方式（备选，不想手动执行以上步骤时）

```bash
mkdir -p /opt/stacks
git clone https://github.com/beiwang02/asset-studio.git /opt/stacks/asset-studio
cd /opt/stacks/asset-studio
sudo bash install.sh
```

脚本自动检查并安装 Docker、保留已有 `.env`，然后构建启动服务。两种方式的编排文件位置一致：`/opt/stacks/asset-studio/compose.yaml`。

### Compose 编排

根目录的 [`compose.yaml`](compose.yaml) 提供单容器编排：

```yaml
services:
  asset-studio:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: asset-studio
    restart: unless-stopped
    env_file:
      - .env
    environment:
      HOST: 0.0.0.0
      PORT: 8765
    ports:
      - "${GITHUB_IMAGE_HOST_BIND:-0.0.0.0}:${GITHUB_IMAGE_HOST_PORT:-8765}:8765"
    volumes:
      - access-policy:/app/data
    read_only: true
    security_opt:
      - no-new-privileges:true

volumes:
  access-policy:
    name: github-image-host-access-policy
```

- `8765:8765`：宿主机和容器均使用 `8765` 端口。
- `access-policy`：仅保存管理员访问策略，不保存图片、JSON 或 OAuth 授权凭据。
- `read_only` 与 `no-new-privileges`：限制容器运行权限。

OAuth 登录所需的 `.env` 配置见「GitHub OAuth 登录配置」；访问名单见「管理员配置」。

## 管理员配置（可选）

管理员配置只用于按需控制网站访问；仓库会按项目规则自动检测，无需额外指定环境变量：

```env
ADMIN_GITHUB_LOGIN=your-github-username
ALLOWED_GITHUB_LOGINS=
```

- `ADMIN_GITHUB_LOGIN`：可选的管理员 GitHub 用户名；不配置不影响普通使用。
- `ALLOWED_GITHUB_LOGINS`：可选的逗号分隔允许名单；留空表示所有登录用户可访问。

## 文件说明

- `server.mjs`：OAuth 内存会话、GitHub API 代理和静态服务
- `github.js`：GitHub 仓库读取、图片/JSON/分组操作和原子提交
- `console.js`：控制台页面交互
- `compose.yaml`、`Dockerfile`、`install.sh`：Docker Compose 部署

## 许可证

项目代码采用 [MIT License](LICENSE)。第三方 Floating UI 与 Inter 字体仍适用各自许可，分别见 `vendor/floating-ui/LICENSE` 和 `fonts/OFL.txt`。
