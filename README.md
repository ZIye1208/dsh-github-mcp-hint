# dsh-github-mcp-hint

A DSH plugin that shows a "Connect GitHub · try it like this" example-prompt page in **Settings → Plugins → GitHub MCP**, picking **4 random examples from a pool of 30**, click to copy.

## Features

- Renders inside **Settings → Plugins → "GitHub MCP"** tab (no longer occupies the space above the composer).
- Built-in **30-example pool**; **picks 4 random** on open, plus a "shuffle" button.
- Click an example to **copy to clipboard**; paste into the chat to let the model act.
- Depends on `@deepseek-ai/dsh-mcp-client` wired to the [GitHub remote MCP Server](https://api.githubcopilot.com/mcp/).

## Install

Via the DSH plugin manager from this repository:

```sh
dsh plugin --profile <profile> add github:ZIye1208/dsh-github-mcp-hint
```

Or add this repo as a local `link:` dependency in the profile's `package.json`, add it to `dsh.profile.bundles`, then restart DSH.

## Prerequisite: wire up GitHub MCP

This plugin is only the example-prompt page; actual GitHub operations need DSH connected to GitHub MCP. Add to the profile's `cordis.patch.yml`:

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

Set `GITHUB_TOKEN` (a GitHub PAT with `repo` / `read:org` / `read:packages`), then restart DSH. GitHub tools appear as `mcp__github__*` (e.g. `mcp__github__list_pull_requests`, `mcp__github__create_pull_request`, `mcp__github__search_repositories`).

## License

[MIT](./LICENSE)