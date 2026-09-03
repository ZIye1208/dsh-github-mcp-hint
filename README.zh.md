# dsh-github-mcp-hint

> 在 DSH 设置页（设置 → 插件 → GitHub MCP）展示「连接 GitHub · 试试这样用」示例提示，从 30 条示例中随机展示 4 条，点击即可复制到剪贴板，方便用自然语言驱动 GitHub MCP 工具。

## 功能

- 在 **设置 → 插件 → 「GitHub MCP」标签页** 内展示 GitHub MCP 的示例用法（不再占用输入框上方的空间）。
- 内置 **30 条示例**池，打开页面时**随机取 4 条**；点「换一批」可再随机 4 条。
- 点击某条示例**复制到剪贴板**，粘到对话里即可让模型执行。
- 依赖宿主已配置的 `@deepseek-ai/dsh-mcp-client` 接入 [GitHub 官方远程 MCP Server](https://api.githubcopilot.com/mcp/)。

## 安装

通过 DSH 插件管理器，从本仓库安装：

```sh
# 在目标 profile 上安装（示例）
dsh plugin --profile <profile> add github:ZIye1208/dsh-github-mcp-hint
```

或手动：把本仓库作为本地依赖加入 profile 的 `package.json`（`link:`），并将其加入 `dsh.profile.bundles`，然后重启 DSH。

## 前置：接入 GitHub MCP

本插件只是「示例提示面板」，真正执行 GitHub 操作需要 DSH 已接入 GitHub MCP。在 profile 的 `cordis.patch.yml` 加入：

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

并设置环境变量 `GITHUB_TOKEN`（GitHub PAT，需 `repo` / `read:org` / `read:packages` 权限），然后重启 DSH。接入后 GitHub 工具会以 `mcp__github__*` 形式出现（如 `mcp__github__list_pull_requests`、`mcp__github__create_pull_request`、`mcp__github__search_repositories`）。

## 示例

随机的 4 条示例覆盖：克隆仓库、查看/创建/合并 Pull Request、列分支/提交、搜代码、建 issue、看 release、fork、协作者、复制文件等。

## 许可

[MIT](./LICENSE)