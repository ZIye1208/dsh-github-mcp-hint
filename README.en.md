# dsh-github-mcp-hint

**[English](./README.en.md) · [中文](./README.md)**

A DSH plugin that adds a **Settings → Plugins → GitHub MCP** page (public repo stats + example prompts) and a model tool **`gh_repo_stats`** (stars, forks and 14-day clone counts for the authenticated account).

## Features

### ① Settings page "GitHub MCP"
- **Public repos**: the browser fetches the GitHub public API directly (no token, safest) and shows your **public** repos' ⭐stars / 🍴forks / language; click to open the repo. The public API does not include private repos or clone counts.
- **Try it like this**: a built-in **30-example pool**, showing **4 random** on open; a "shuffle" button re-picks 4; click an example to **copy** it to the clipboard.

### ② Model tool `gh_repo_stats`
- A host-registered model tool that reads `GITHUB_TOKEN` and returns **all** of the account's repos (including private) with stars, forks and **14-day clone counts**.
- Usage: ask in the chat "how many stars/downloads do my repos have" and the model calls `gh_repo_stats`.

> **Why split into "panel public data + chat-tool download counts"**: GitHub's public API lets you read public repos' stars/forks without a token (so the panel can use it and never leaks credentials); but **clone/download counts require auth**, and the token must stay on the Node host side (the browser must not hold it), so those come through the host-side model tool.

## Install

Via the DSH plugin manager from this repository:

```sh
dsh plugin --profile <profile> add github:ZIye1208/dsh-github-mcp-hint
```

Or add this repo as a local `link:` dependency in the profile's `package.json`, add it to `dsh.profile.bundles`, then restart DSH.

## Prerequisite: wire up GitHub MCP + set a token

The examples and the tool depend on DSH being connected to GitHub MCP. Add to the profile's `cordis.patch.yml`:

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

## Notes

- The panel's "public repos" section takes a GitHub username from an input on the page and remembers it in `localStorage`, so any account works without touching the source.
- `gh_repo_stats` is not shown in the panel; call it from the chat. Use it if you want private repos or clone counts.

## License

[MIT](./LICENSE)
