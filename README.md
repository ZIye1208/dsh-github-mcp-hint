# dsh-github-mcp-hint

**[English](./README.en.md) · 中文**

> 也可作为 [dsh-github-mcp](https://github.com/ZIye1208/dsh-github-mcp) 的依赖被一并安装。**本面板插件可独立卸载/禁用**，不影响 GitHub MCP 功能。

> 在 DSH 的「设置 → 插件 → GitHub MCP」页展示 GitHub 示例用法，并显示你的公开仓库统计；同时提供模型工具 `gh_repo_stats`，可查当前账号仓库的星数、fork 与近 14 天克隆量。

## 功能

### ① 设置页「GitHub MCP」

- **公开仓库区**：浏览器直连 GitHub 公开 API（无 token、最安全），显示你的**公开**仓库的 ⭐星 / 🍴fork / 语言，点击跳转仓库。GitHub 公开 API 不含私有仓库与克隆量。
- **试试这样用**：内置 **30 条示例池**，打开时随机取 **4 条**；点「换一批」再随机 4 条；点击示例即可**复制到剪贴板**。

### ② 模型工具 `gh_repo_stats`

- 宿主注册的模型工具，读取 `GITHUB_TOKEN`，拉取当前账号**全部仓库（含私有）**的星数、fork 与**近 14 天克隆量**。
- 用法：在对话里直接问「我的仓库有多少星多少下载」，模型会调用 `gh_repo_stats` 并展示。

> **为什么拆成「面板公开数据 + 对话工具下载量」**：GitHub 公开 API 无需 token 就能读公开仓库的星/fork（所以面板可用、且不泄露凭证）；但**克隆/下载量必须鉴权**，而 token 只能留在 Node 宿主侧（浏览器不能持有），所以通过模型工具在宿主侧读取。

## 安装

通过 DSH 插件管理器，从本仓库安装：

```sh
dsh plugin --profile <profile> add github:ZIye1208/dsh-github-mcp-hint
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

- 面板的「公开仓库区」使用页面上的「GitHub 用户名」输入框查询公开仓库，并用 `localStorage` 记住上次输入，无需改源码即可适配其它账号。
- `gh_repo_stats` 不在面板展示，只在对话里调用；若要含私有仓库或克隆量，用它。

## 许可

[MIT](./LICENSE)
