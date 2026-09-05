# dsh-github-mcp-hint

**[English](./README.en.md) · [中文](./README.md)**

A DSH plugin that adds a **Settings → Plugins → GitHub MCP** page (example prompts + repo-stats guidance) and model tools **`gh_repo_stats`** / **`gh_current_user`** (stars, forks, 14-day clone counts and the current account).

## Features

### ① Settings page "GitHub MCP"
- **Example pool**: a built-in **30-example pool**, showing **4 random** on open; a "shuffle" button re-picks 4; click an example to **copy** it to the clipboard.
- **Repo stats**: the panel no longer calls GitHub directly. It guides you to query the **host-side, token-bearing** model tools `gh_repo_stats` / `gh_current_user` from the chat. This avoids browser-side unauth 403 / rate limits, and never ships the token to the browser.

### ② Model tool `gh_repo_stats`
- A host-registered model tool that reads `GITHUB_TOKEN` and returns **all** of the account's repos (including private) with stars, forks and **14-day clone counts**.
- Usage: ask in the chat "how many stars/downloads do my repos have" and the model calls `gh_repo_stats`.

> **Why the panel no longer calls GitHub directly**: v0.2.0's panel did an **unauthenticated** browser `fetch` to `api.github.com/users/{user}/repos` to show public repo stats. GitHub caps unauthenticated REST at 60 requests/hour/IP (over that it returns **403**), and that IP is often shared with the DSH host, so it is easily exhausted — exactly the "fine yesterday, 403 today" symptom. Since v0.3.0 all repo stats go through the **host-side, token-bearing** tools (5000/hour, persistent), so the browser makes **zero** unauth requests and the 403 is eliminated at the root.

## Install

> Note: DSH adds only **top-level dependencies** to a profile's bundles layer, so this panel plugin must be **explicitly** installed via one of the ways below to appear in "Settings → Plugins → GitHub MCP"; merely being carried as a dependency of `dsh-github-mcp` does **not** show it automatically.

### npm (recommended, published to npmjs)

```sh
dsh plugin --profile web add dsh-github-mcp-hint
```

### GitHub (alternative)

```sh
dsh plugin --profile web add github:ZIye1208/dsh-github-mcp-hint
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

- The panel (browser side) **no longer calls any GitHub API**; it only shows example prompts and guidance. Query repo stats from the **chat** with `gh_repo_stats` / `gh_current_user`.
- `gh_repo_stats` is not shown in the panel; call it from the chat. Use it if you want private repos or clone counts.

## Changelog

### v0.3.0 (root-fix the 403)
- Removed the browser-side unauth `fetch` to `api.github.com/users/{user}/repos` (the source of `403` / unauth rate limiting).
- The panel's "public repo stats" now guides users to the host-side token-bearing tools `gh_repo_stats` / `gh_current_user`.
- Updated `package.json` description and README (EN/ZH).

## License

[MIT](./LICENSE)