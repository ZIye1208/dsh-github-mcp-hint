# dsh-github-mcp-hint

**[English](./README.en.md) · 中文**

> 也可作为 [dsh-github-mcp](https://github.com/ZIye1208/dsh-github-mcp) 的依赖被一并安装。**本面板插件可独立卸载/禁用**，不影响 GitHub MCP 功能。

> 在 DSH 的「设置 → 插件 → GitHub MCP」页展示 GitHub 示例用法，并显示你的公开仓库统计；同时提供模型工具 `gh_repo_stats`，可查当前账号仓库的星数、fork 与近 14 天克隆量。

## 功能

### ① 设置页「GitHub MCP」

- **示例池**：内置 **30 条示例池**，打开时随机取 **4 条**；点「换一批」再随机 4 条；点击示例即可**复制到剪贴板**。
- **仓库统计**：面板不再直连 GitHub API，改为**引导你在对话里查询**——点提示调用宿主侧带 token 的 `gh_repo_stats` / `gh_current_user`。这样既避免浏览器直连触发 GitHub 403 / 未认证限流，也绝不把 token 下发到浏览器。

### ② 模型工具

- **`gh_repo_stats`**：宿主注册的模型工具，读取 `GITHUB_TOKEN`，拉取当前账号**全部仓库（含私有）**的星数、fork 与**近 14 天克隆量**（并发拉取克隆量，最多列出前 30 个的统计，避免限流；`无数据` 通常是该仓库无流量、无权限或已限流）。
- **`gh_current_user`**：显示当前 token 对应的 GitHub 账号（login），便于在对话里核对当前账号。
- 用法：在对话里直接问「我的仓库有多少星多少下载」「当前 GitHub 账号是谁」，模型会调用对应工具并展示。

> **为什么不再让浏览器直连 GitHub API**：v0.2.0 的面板曾用浏览器**未认证**直连 `api.github.com/users/{user}/repos` 读公开仓库统计。GitHub 对未认证 REST 请求按 IP 每小时限流 60 次（超限返回 **403**），且该 IP 往往与 DSH 宿主共享，极易被耗尽——这正是「昨天正常、今天 403」的原因。v0.3.0 起，仓库统计全部交给**宿主侧带 token** 的工具读取（限额 5000/小时、持久且不回退），浏览器**零**未认证请求，403 从根上消除。

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

- 面板（浏览器侧）**不再直连任何 GitHub API**，只做示例提示与引导；仓库统计请在**对话**里使用 `gh_repo_stats` / `gh_current_user` 工具。
- `gh_repo_stats` 不在面板展示，只在对话里调用；若要含私有仓库或克隆量，用它。

## 更新日志

### v0.3.0（根治 403）
- **彻底移除**浏览器侧对 `api.github.com/users/{user}/repos` 的未认证直连（这是 `403 / 未认证限流` 的根源）。
- 面板「公开仓库统计」改为引导用户在对话里调用宿主侧带 token 的工具 `gh_repo_stats` / `gh_current_user`。
- 更新 package.json `description`、README 中/英文说明与示例。

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