# dsh-github-mcp-hint

**[English](./README.en.md) · 中文**

> 也可作为 [dsh-github-mcp](https://github.com/ZIye1208/dsh-github-mcp) 的依赖被一并安装。**本面板插件可独立卸载/禁用**，不影响 GitHub MCP 功能。

> 在 DSH 的「设置 → 插件 → GitHub MCP」页展示 GitHub 示例用法，并显示你的公开仓库统计；同时提供模型工具 `gh_repo_stats`，可查当前账号仓库的星数、fork 与近 14 天克隆量。

## 功能

### ① 设置页「GitHub MCP」

- **示例池**：内置 **30 条示例池**，打开时随机取 **4 条**；点「换一批」再随机 4 条；点击示例即可**复制到剪贴板**。
- **公开仓库统计（可视化）**：输入 GitHub 用户名，面板**可视化展示**该用户公开仓库的 ⭐星 / 🍴fork / 语言，点击跳转仓库。为避免触发 GitHub 未认证 403/限流，前端做了两件事：① **本地缓存降频**（结果存 `localStorage`，30 分钟内不重复请求，几乎不消耗 API 配额）；② **优雅容错**（遇到 403/429/网络失败时回退展示缓存数据并给出提示，而不是空白/报错）。token 始终不带入浏览器。
- **仓库统计（需鉴权，对话工具）**：克隆量、含私有仓库的统计请在对话里调用宿主侧带 token 的 `gh_repo_stats` / `gh_current_user` 获取。

### ② 模型工具

- **`gh_repo_stats`**：宿主注册的模型工具，读取 `GITHUB_TOKEN`，拉取当前账号**全部仓库（含私有）**的星数、fork 与**近 14 天克隆量**（并发拉取克隆量，最多列出前 30 个的统计，避免限流；`无数据` 通常是该仓库无流量、无权限或已限流）。
- **`gh_current_user`**：显示当前 token 对应的 GitHub 账号（login），便于在对话里核对当前账号。
- 用法：在对话里直接问「我的仓库有多少星多少下载」「当前 GitHub 账号是谁」，模型会调用对应工具并展示。

> **为什么用「前端直连公开 API + 缓存降频」而不是全部走宿主**：GitHub 公开仓库的星/fork **无需 token** 即可读取，DSH 的宿主→前端没有干净的带 token 数据推送通道（`sessions.provide` 是浏览器端方法，session projection 只能折叠会话事件、无法承载外部 fetch 数据，且设置面板也拿不到 `useProjection`；`host.call` 对 bundled 插件被禁）。所以面板直接用浏览器直连公开 API 是最现实的可视化方案。为了防止 403：v0.3.1 加了**本地缓存降频**（30 分钟 TTL，几乎不消耗 GitHub 未认证 60 次/小时的配额）+ **失败回退缓存**的容错。需鉴权的克隆量/私有仓库数据，仍走宿主侧带 token 的 `gh_repo_stats` / `gh_current_user`。

## 安装

> 注意：DSH 只把**顶层依赖**加入 profile 的 bundles 层，因此本面板插件需**显式**通过下方方式安装，才会在「设置 → 插件 → GitHub MCP」中出现；仅作为 `dsh-github-mcp` 的依赖被携带**不会**自动显示。

### 方式一：npm（推荐，已发布到 npmjs）

```sh
dsh plugin --profile web add dsh-github-mcp-hint
```

### 方式二：GitHub（备选）

```sh
dsh plugin --profile web add github:ZIye1208/dsh-github-mcp-hint
```

或手动：把本仓库作为本地依赖加入 profile 的 `package.json`（`link:`），加入 `dsh.profile.bundles`，然后重启 DSH。

## 前置：接入 GitHub MCP + 设置 token

本插件的「示例」和「工具」依赖 DSH 已接入 GitHub MCP。在 profile 的 `cordis.patch.yml` 加入：

```yaml
- insert:
    - id: mcp-github
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: github
        transport: streamable-http
        url: https://api.githubcopilot.com/mcp/
        headers:
          Authorization: !!js '`Bearer ${process.env.GITHUB_TOKEN}`'
        failOnStartupError: false
```

并设置环境变量 `GITHUB_TOKEN`（GitHub PAT，需 `repo` / `read:org` / `read:packages`），然后重启 DSH。接入后 GitHub 工具以 `mcp__github__*` 形式出现（如 `mcp__github__list_pull_requests`、`mcp__github__create_pull_request`、`mcp__github__search_repositories`）。

## 说明

- 面板用**浏览器直连 GitHub 公开 API**（无需 token）可视化公开仓库的星/fork，但做了**本地缓存降频**（30 分钟 TTL）+ **失败回退缓存**，避免触发未认证 403/限流；token 始终只在宿主侧。
- `gh_repo_stats` 不在面板展示，只在对话里调用；若要含私有仓库或克隆量，用它。

## 更新日志

### v0.3.1（恢复面板可视化 + 防 403）
- **恢复可视化仓库列表**：输入用户名即展示公开仓库的 ⭐星 / 🍴fork / 语言（上一版 v0.3.0 为消除 403 把面板改成了纯引导，反而不可用了）。
- **本地缓存降频**：结果存 `localStorage`，**30 分钟内不重复请求**，几乎不消耗 GitHub 未认证 60 次/小时的配额。
- **失败回退缓存**：遇到 403/429/网络失败时回退展示缓存数据并提示"展示缓存"，而不是空白/报错。
- 保留宿主侧带 token 的 `gh_repo_stats` / `gh_current_user` 负责克隆量、私有仓库等需鉴权数据。
- 说明：经源码核实，DSH 无「宿主带 token 拉取 → 推给前端面板」的干净通道（`sessions.provide` 是浏览器端方法；session projection 只能折叠会话事件、且设置面板拿不到 `useProjection`；`host.call` 对 bundled 插件被禁），故采用「前端直连公开 API + 缓存降频」这一现实方案。

### v0.3.0（根治 403）
- 移除浏览器侧对 `api.github.com/users/{user}/repos` 的未认证直连（该直连受未认证限流，超限返回 403）。
- 前端增加 401/403 错误语义化提示；仓库统计改为引导对话工具。
- 后续在 v0.3.1 中恢复为「可视化 + 缓存降频」以兼顾可用性与防 403。

### v0.2.0
- `gh_repo_stats`：并发拉取克隆量（限 5 并发），标注「共 N 个 / 仅列前 30」，区分 429 限流 / 无权限 / 无数据。
- 新增 `gh_current_user` 模型工具：返回当前 token 对应的 GitHub 账号。
- 示例池逐条标注写操作（UI 显示 ⚠️）。
- 面板状态区增加 `mcp__github__*` 未出现时的排查指引（先 `github_token_status` 再重启）。
- 剪贴板增加 `execCommand('copy')` 兜底。
- 用户名输入框提示可用 `gh_current_user` 查询当前账号。

### v0.1.0
- 初次发布：设置页「GitHub MCP」+ 示例池 + 公开仓库统计 + `gh_repo_stats`。

## 许可

[MIT](./LICENSE)