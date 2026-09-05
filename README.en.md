# dsh-github-mcp-hint

**[English](./README.en.md) · [中文](./README.md)**

A DSH plugin that adds a **Settings → Plugins → GitHub MCP** page (public repo stats + example prompts) and a model tool **`gh_repo_stats`** (stars, forks and 14-day clone counts for the authenticated account).

## Features

### ① Settings page "GitHub MCP"
- **Example pool**: a built-in **30-example pool**, showing **4 random** on open; a "shuffle" button re-picks 4; click an example to **copy** it to the clipboard.
- **Public repo stats (visual)**: type a GitHub username and the panel **visualizes** that user's public repos' ⭐stars / 🍴forks / language; click to open the repo. To avoid GitHub unauth 403/rate limits the front end does two things: **① local cache + throttling** (results stored in `localStorage`, no repeated requests within 30 minutes, so it barely touches GitHub's 60/hour/IP unauth budget) and **② graceful fallback** (on 403/429/network failure it shows cached data with a note instead of a blank/error). The token never reaches the browser.
- **Auth-only repo stats (chat tool)**: clone counts and private-repo stats come from the host-side token-bearing `gh_repo_stats` / `gh_current_user` tools in the chat.

### ② Model tool `gh_repo_stats`
- A host-registered model tool that reads `GITHUB_TOKEN` and returns **all** of the account's repos (including private) with stars, forks and **14-day clone counts**.
- Usage: ask in the chat "how many stars/downloads do my repos have" and the model calls `gh_repo_stats`.

> **Why "front-end direct public API + cache throttling" instead of going fully through the host**: GitHub's public repo stars/forks need **no token**, and DSH has **no clean host→front-end channel** for token-bearing data push (`sessions.provide` is a browser-side method; session projection can only fold session events, not carry external fetch data, and the settings tab has no `useProjection`; `host.call` is disabled for bundled plugins). So the browser calling the public API directly is the most practical way to keep the panel visual. To prevent 403, v0.3.1 adds **local cache + throttling** (30-min TTL, barely consuming GitHub's 60/hour/IP unauth quota) and **fallback-to-cache** on errors. Auth-only data (clone counts, private repos) still comes from the host-side token-bearing tools.

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

- The panel uses a **browser direct call to GitHub's public API** (no token) to visualize public repo stars/forks, but with **local cache + throttling** (30-min TTL) and **fallback-to-cache** on errors, to avoid unauth 403/rate limits; the token stays host-side only.
- `gh_repo_stats` is not shown in the panel; call it from the chat. Use it if you want private repos or clone counts.

## Changelog

### v0.3.1 (restore panel visualization + anti-403)
- **Restored the visual repo list**: type a username and the public repos' ⭐stars / 🍴forks / language are shown (the previous v0.3.0 turned the panel into pure guidance to kill 403, which made it useless).
- **Local cache + throttling**: results are stored in `localStorage`, with **no repeated request within 30 minutes**, so it barely uses GitHub's 60/hour/IP unauth quota.
- **Fallback-to-cache on errors**: on 403/429/network failure it shows cached data with a "showing cache" note instead of a blank/error.
- Keep the host-side token-bearing `gh_repo_stats` / `gh_current_user` for clone counts, private repos, etc.
- Note: source inspection confirmed DSH has **no clean host→front-end channel** to push token-bearing data (`sessions.provide` is a browser-side method; session projection can only fold session events and the settings tab has no `useProjection`; `host.call` is disabled for bundled plugins), so "front-end direct public API + cache throttling" is the practical approach.

### v0.3.0 (root-fix the 403)
- Removed the browser-side unauth `fetch` to `api.github.com/users/{user}/repos` (the source of `403` / unauth rate limiting).
- The panel's "public repo stats" guides users to the host-side token-bearing tools `gh_repo_stats` / `gh_current_user`; added 401/403 error hints.
- In v0.3.1 this was revisited as "visual + cache throttling" to balance usability and anti-403.

## License

[MIT](./LICENSE)