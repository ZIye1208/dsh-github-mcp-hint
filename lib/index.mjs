// dsh-github-mcp-hint host half.
// Registers model-visible tools:
//   `gh_repo_stats`  — stars/forks/clone counts for the authenticated account.
//   `gh_current_user` — the GitHub login for the current token.
// Real (bundled) plugins cannot use the dynamic-only `host.call`/`harness.handle`
// pair, so authenticated data (stars + clone counts) is delivered through model
// tools: the user asks in the chat and the agent calls them. The token is read
// from the host process env only — never shipped to the browser.

async function fetchJson(url, token) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (res.status === 429) throw Object.assign(new Error("rate limited"), { status: 429 });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// Pull 14-day clone counts for up to `limit` repos, with bounded concurrency so a
// big account does not hammer the API / burn rate limits.
async function fetchCloneCounts(repos, token, limit, concurrency) {
  const top = repos.slice(0, limit);
  const out = new Array(top.length).fill(null);
  let cursor = 0;
  async function worker() {
    while (cursor < top.length) {
      const i = cursor++;
      try {
        const t = await fetchJson(`https://api.github.com/repos/${top[i].full_name}/traffic/clones`, token);
        if (t && typeof t.count === "number") out[i] = t.count;
      } catch (err) {
        // 429 / no access / no data → leave null
      }
    }
  }
  const n = Math.max(1, Math.min(concurrency, top.length));
  await Promise.all(Array.from({ length: n }, worker));
  return { top, counts: out };
}

async function buildStats() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return "未检测到 GITHUB_TOKEN 环境变量，无法读取账号仓库统计。";

  let repos;
  try {
    repos = await fetchJson(
      "https://api.github.com/user/repos?type=owner&per_page=100&sort=updated",
      token
    );
  } catch (err) {
    return `拉取仓库失败：${err && err.message || err}（可能是 token 无效/过期或限流，用 github_set_token 更新并重启 DSH）。`;
  }
  if (!Array.isArray(repos)) repos = [];

  if (repos.length === 0) return "没有可显示的仓库。";

  const LIMIT = 30;
  const { top, counts } = await fetchCloneCounts(repos, token, LIMIT, 5);

  const lines = top.map((repo, i) => {
    const c = counts[i];
    const cloneStr = c === null ? "无数据" : ` ${c}`;
    return `- ${repo.full_name}${repo.private ? "（私有）" : ""}：⭐${repo.stargazers_count} / 🍴${repo.forks_count} / 克隆(近14天)${cloneStr}${repo.language ? ` / ${repo.language}` : ""}`;
  });

  const totalNote = repos.length > top.length
    ? `共 ${repos.length} 个仓库，仅列出前 ${top.length} 个的统计`
    : `共 ${repos.length} 个仓库`;
  const tail = "（克隆量需鉴权且受 GitHub rate limit 影响；显示`无数据`通常是该仓库无流量、无权限或已限流）";
  return `你的 GitHub 仓库统计（${totalNote}）：\n${lines.join("\n")}\n\n${tail}`;
}

async function buildCurrentUser() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return "未检测到 GITHUB_TOKEN 环境变量，无法读取当前账号。";
  try {
    const u = await fetchJson("https://api.github.com/user", token);
    return u && u.login ? `当前 GitHub 账号：${u.login}` : "无法解析当前账号。";
  } catch (err) {
    return `读取当前账号失败：${err && err.message || err}（token 无效/过期或限流）。`;
  }
}

function apply(ctx) {
  const tools = ctx.get("tools");
  if (tools === undefined) return;

  tools.register({
    name: "gh_repo_stats",
    description: "查看当前 GitHub 账号（GITHUB_TOKEN 对应账号）的仓库统计：仓库名、星数、fork、近14天克隆量。无参数。",
    parameters: { type: "object", properties: {} },
    output: {
      schema: { type: "string" },
      render: function (_args, value) { return [{ type: "text", text: String(value) }]; },
    },
    async execute() {
      return buildStats();
    },
  });

  tools.register({
    name: "gh_current_user",
    description: "查看当前 GitHub token 对应的账号（login）。无参数。",
    parameters: { type: "object", properties: {} },
    output: {
      schema: { type: "string" },
      render: function (_args, value) { return [{ type: "text", text: String(value) }]; },
    },
    async execute() {
      return buildCurrentUser();
    },
  });
}

export default { inject: ["tools"], apply };
