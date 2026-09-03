// dsh-github-mcp-hint host half.
// Registers a model-visible tool `gh_repo_stats`. Real (bundled) plugins cannot
// use the dynamic-only `host.call`/`harness.handle` pair, so authenticated data
// (stars + clone counts) is delivered through a model tool: the user asks in the
// chat and the agent calls it. The token is read from the host process env only.

async function fetchJson(url, token) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
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
    return `拉取仓库失败：${err && err.message || err}`;
  }
  if (!Array.isArray(repos)) repos = [];

  const lines = [];
  for (const repo of repos.slice(0, 30)) {
    let clones = null;
    try {
      const t = await fetchJson(
        `https://api.github.com/repos/${repo.full_name}/traffic/clones`,
        token
      );
      if (t && typeof t.count === "number") clones = t.count;
    } catch (err) {
      // rate limit / no data for this repo
    }
    lines.push(
      `- ${repo.full_name}${repo.private ? "（私有）" : ""}：⭐${repo.stargazers_count} / 🍴${repo.forks_count} / 克隆(近14天)${clones === null ? " 无数据" : ` ${clones}`}${repo.language ? ` / ${repo.language}` : ""}`
    );
  }
  if (lines.length === 0) return "没有可显示的仓库。";
  return `你的 GitHub 仓库统计（共 ${repos.length} 个）：\n${lines.join("\n")}`;
}

function apply(ctx) {
  return ctx.tools.register({
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
}

export default { inject: ["tools"], apply };