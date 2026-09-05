window.__ModuleLoader__.load({
  id: "dsh-github-mcp-hint",
  factory: (require) => {
    var reactModule = require("react");
    var React = reactModule.default || reactModule;

    // 示例池：30 条，页面每次随机取 4 条展示。w:true 表示会写入/改动 GitHub 数据（UI 标注 ⚠️）。
    var POOL = [
      { t: "帮我克隆 https://github.com/torvalds/linux 到本地并简要介绍这个仓库的结构", w: false },
      { t: "查看仓库 owner/repo 里所有 open 状态的 Pull Request，按更新时间倒序，告诉我每个 PR 的标题、作者和变更规模", w: false },
      { t: "在当前分支提交所有改动并推送到 GitHub，提交消息按我做的变更自动生成", w: true },
      { t: "给 owner/repo 的 PR #123 添加一条评论说明测试已通过，并把它标记为 ready for review", w: true },
      { t: "列出仓库 owner/repo 的所有分支，并告诉我每个分支最后一次提交的时间", w: false },
      { t: "在 owner/repo 里搜索包含关键词 xxx 的代码文件，给我文件路径", w: false },
      { t: "看下 owner/repo 最近 10 条提交都改了什么，给我每条提交的标题和作者", w: false },
      { t: "创建一个新的 issue，标题是“xxx”，正文是“yyy”，owner/repo 设为该仓库", w: true },
      { t: "把分支 feature-xxx 合并回 main，采用 merge 方式", w: true },
      { t: "创建一条从 main 到 feature-xxx 的 pull request，标题是“xxx”，描述是“yyy”", w: true },
      { t: "删除远程分支 feature-old", w: true },
      { t: "把仓库 owner/repo fork 到我自己名下", w: true },
      { t: "看下 PR #456 改动的 diff 和上面的评论", w: false },
      { t: "给 PR #789 提交一个 review 并 approve（approve）", w: true },
      { t: "把仓库 owner/repo 最新的 release 告诉我，包括 tag、发布日期和说明", w: false },
      { t: "查看我自己的 GitHub 账号信息", w: false },
      { t: "列出仓库 owner/repo 的所有标签 tag", w: false },
      { t: "读取仓库 owner/repo 的 README 内容并总结", w: false },
      { t: "给 owner/repo 的 PR #123 的评论作一个回复", w: true },
      { t: "列出 owner/repo 当前打开的 issues，告诉我标题和作者", w: false },
      { t: "把当前分支的改动通过 create_or_update_file 推送到 owner/repo", w: true },
      { t: "搜索我创建的所有仓库，按最近更新时间排序", w: false },
      { t: "获取 owner/repo 仓库里某个文件在默认分支的内容", w: false },
      { t: "看下 PR #999 的合并状态和是否通过 CI", w: false },
      { t: "列出仓库 owner/repo 的协作者列表", w: false },
      { t: "给当前仓库创建一个 .gitignore 文件并提交", w: true },
      { t: "把分支 feature-xxx 重命名为 feature-xxx-2 并推送", w: true },
      { t: "列出仓库 owner/repo 最近 3 个 release", w: false },
      { t: "在 owner/repo 里搜索 TODO 或 FIXME 注释，定位到文件与行号", w: false },
      { t: "批量把 dist/ 目录下的改动提交，提交消息为“build: 更新产物”", w: true }
    ];

    var CSS = `
.ghmcp-page { font-family: inherit; color: var(--dsw-alias-label-primary); }
.ghmcp-page__head { display: flex; align-items: center; gap: 10px; }
.ghmcp-page__logo {
  font-size: 26px; line-height: 1; width: 44px; height: 44px; flex: 0 0 44px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1); border-radius: 50%;
}
.ghmcp-page__title { font-size: 17px; font-weight: 650; }
.ghmcp-page__desc { font-size: 13px; color: var(--dsw-alias-label-secondary); margin-top: 2px; line-height: 1.5; }
.ghmcp-page__status { margin-top: 12px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
.ghmcp-user { margin-top: 12px; display: flex; gap: 8px; }
.ghmcp-user__input {
  flex: 1; min-width: 0; box-sizing: border-box;
  background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px; padding: 8px 12px; color: var(--dsw-alias-label-primary); font-size: 13px;
}
.ghmcp-user__input:focus { outline: none; border-color: var(--dsw-alias-brand-primary); }
.ghmcp-user__btn {
  background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-primary); border-radius: 8px; padding: 8px 14px; font-size: 13px; cursor: pointer; flex: none;
}
.ghmcp-user__btn:hover { border-color: var(--dsw-alias-brand-primary); }
.ghmcp-page__label { font-size: 13px; color: var(--dsw-alias-label-secondary); }
.ghmcp-page__bar { margin-top: 14px; display: flex; align-items: center; gap: 10px; }
.ghmcp-page__shuffle {
  background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-primary);
  border-radius: 8px; padding: 6px 12px; font-size: 12px; cursor: pointer;
}
.ghmcp-page__shuffle:hover { border-color: var(--dsw-alias-brand-primary); }
.ghmcp-page__count { font-size: 12px; color: var(--dsw-alias-label-secondary); }
.ghmcp-prompt {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
  text-align: left; width: 100%; box-sizing: border-box; margin-top: 8px;
  background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px; padding: 10px 12px; color: var(--dsw-alias-label-primary); cursor: pointer;
  font-size: 13px; line-height: 1.5;
}
.ghmcp-prompt:hover { border-color: var(--dsw-alias-brand-primary); }
.ghmcp-prompt__icon { flex: 0 0 auto; opacity: .7; font-size: 14px; }
.ghmcp-copied { font-size: 12px; color: var(--dsw-alias-state-success-primary); margin-top: 6px; min-height: 16px; }
.ghmcp-page__stats { margin-top: 12px; }
.ghmcp-repo {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  text-decoration: none; width: 100%; box-sizing: border-box; margin-top: 6px;
  background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px; padding: 8px 12px; color: var(--dsw-alias-label-primary); font-size: 13px;
}
.ghmcp-repo:hover { border-color: var(--dsw-alias-brand-primary); }
.ghmcp-repo__name { color: var(--dsw-alias-label-primary); }
.ghmcp-repo__meta { color: var(--dsw-alias-label-secondary); font-size: 12px; flex: none; }
.ghmcp-error { margin-top: 8px; font-size: 12px; color: var(--dsw-alias-state-warn-primary); }
.ghmcp-note { margin-top: 8px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
`;

    function pickN(pool, n) {
      var arr = pool.slice();
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      return arr.slice(0, n);
    }

    // —— 本地缓存：降低公开 API 请求频率，避免触发 GitHub 未认证 403/限流 ——
    var CACHE_TTL_MS = 30 * 60 * 1000; // 30 分钟内不重复请求
    function cacheKey(user) { return "ghmcp_cache_" + user.trim().toLowerCase(); }
    function readCache(user) {
      try {
        var raw = localStorage.getItem(cacheKey(user));
        if (!raw) return null;
        var o = JSON.parse(raw);
        if (!o || !Array.isArray(o.repos)) return null;
        return o;
      } catch (e) { return null; }
    }
    function writeCache(user, repos, error) {
      try {
        localStorage.setItem(cacheKey(user), JSON.stringify({
          ts: Date.now(),
          user: user.trim(),
          repos: repos || [],
          error: error || null
        }));
      } catch (e) {}
    }

    function GitHubHint() {
      var state = React.useState(function () { return pickN(POOL, 4); });
      var picked = state[0];
      var setPicked = state[1];
      var copyState = React.useState("");
      var copied = copyState[0];
      var setCopied = copyState[1];

      var usernameState = React.useState(function () {
        try { return localStorage.getItem("ghmcp_username") || ""; } catch (e) { return ""; }
      });
      var username = usernameState[0];
      var setUsername = usernameState[1];

      var statsState = React.useState(null);
      var stats = statsState[0];
      var setStats = statsState[1];
      var loadingState = React.useState(false);
      var loading = loadingState[0];
      var setLoading = loadingState[1];

      var requestIdRef = React.useRef(0);

      var loadStats = function (name, force) {
        var trimmed = String(name == null ? "" : name).trim();
        if (trimmed === "") { setLoading(false); setStats({ repos: [], error: "请输入 GitHub 用户名", fromCache: false }); return; }

        var id = ++requestIdRef.current;

        // 命中缓存且未过期，直接展示，不发请求
        if (!force) {
          var cached = readCache(trimmed);
          if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
            setLoading(false);
            setStats({ repos: cached.repos, error: cached.error, fromCache: true, ts: cached.ts });
            try { localStorage.setItem("ghmcp_username", trimmed); } catch (e) {}
            return;
          }
        }

        setLoading(true);
        setStats(null);
        var url = "https://api.github.com/users/" + encodeURIComponent(trimmed) + "/repos?sort=updated&per_page=100";
        fetch(url, { headers: { Accept: "application/vnd.github+json" } }).then(function (res) {
          if (!res.ok) throw new Error(String(res.status) + " " + res.statusText);
          return res.json();
        }).then(function (repos) {
          if (id !== requestIdRef.current) return;
          var list = (Array.isArray(repos) ? repos : []).map(function (r) {
            return {
              full_name: r.full_name || (r.owner && r.owner.login ? r.owner.login + "/" + r.name : r.name),
              html_url: r.html_url,
              stars: typeof r.stargazers_count === "number" ? r.stargazers_count : 0,
              forks: typeof r.forks_count === "number" ? r.forks_count : 0,
              language: r.language || null,
              private: !!r.private
            };
          });
          writeCache(trimmed, list, null);
          setLoading(false);
          setStats({ repos: list, error: null, fromCache: false, ts: Date.now() });
          try { localStorage.setItem("ghmcp_username", trimmed); } catch (e) {}
        }).catch(function (err) {
          if (id !== requestIdRef.current) return;
          var msg = String(err && err.message || err);
          var isRate = /403|429|rate limit/i.test(msg);
          // 失败了：优先回退到缓存，避免面板空白
          var cached = readCache(trimmed);
          if (cached) {
            setLoading(false);
            setStats({ repos: cached.repos, error: isRate ? "公开 API 限额（" + msg + "），已展示缓存数据" : msg, fromCache: true, ts: cached.ts });
            return;
          }
          setLoading(false);
          setStats({ repos: [], error: "读取公开仓库失败：" + msg, fromCache: false });
        });
      };

      // 打开时：有缓存就立即展示缓存（不发请求）；无缓存且已有用户名才请求一次
      React.useEffect(function () {
        var saved = null;
        try { saved = localStorage.getItem("ghmcp_username") || ""; } catch (e) {}
        if (saved && String(saved).trim() !== "") {
          var c = readCache(saved);
          if (c) {
            setStats({ repos: c.repos, error: c.error, fromCache: true, ts: c.ts });
          } else {
            loadStats(saved, false);
          }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      var onCopy = function (text) {
        function ok() { setCopied(text); }
        function fail() {
          try {
            var ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            var done = document.execCommand && document.execCommand("copy");
            document.body.removeChild(ta);
            done ? ok() : setCopied("");
          } catch (e) { setCopied(""); }
        }
        try {
          Promise.resolve(
            typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText
              ? navigator.clipboard.writeText(text)
              : Promise.reject()
          ).then(ok, fail);
        } catch (e) { fail(); }
      };

      var promptEls = picked.map(function (p, i) {
        return React.createElement(
          "button",
          { key: i, className: "ghmcp-prompt", onClick: function () { onCopy(p.t); } },
          React.createElement("span", { className: "ghmcp-prompt__text" }, (p.w ? "⚠️ " : "") + p.t),
          React.createElement("span", { className: "ghmcp-prompt__icon" }, "⧉")
        );
      });

      var statsEl = null;
      if (loading) {
        statsEl = React.createElement("div", { className: "ghmcp-page__stats" },
          React.createElement("div", { className: "ghmcp-error" }, "加载中…"));
      } else if (stats) {
        var repoRows = (stats.repos || []).map(function (r, i) {
          return React.createElement("a",
            { key: i, className: "ghmcp-repo", href: r.html_url, target: "_blank", rel: "noopener noreferrer" },
            React.createElement("span", { className: "ghmcp-repo__name" }, (r.private ? "🔒 " : "") + r.full_name),
            React.createElement("span", { className: "ghmcp-repo__meta" }, "⭐ " + r.stars + " · 🍴 " + r.forks + " · " + (r.language || "—"))
          );
        });
        var cacheNote = stats.fromCache
          ? React.createElement("div", { className: "ghmcp-note" }, "（数据来自本地缓存，30 分钟内不重复请求；点「查询」可强制刷新）")
          : null;
        statsEl = React.createElement("div", { className: "ghmcp-page__stats" },
          React.createElement("div", { className: "ghmcp-page__label" }, "公开仓库（⭐星 / 🍴fork；克隆·私有请发消息问我）"),
          stats.error
            ? React.createElement("div", { className: "ghmcp-error" }, String(stats.error))
            : null,
          repoRows.length > 0
            ? React.createElement("div", null, repoRows)
            : React.createElement("div", { className: "ghmcp-error" }, "该用户暂无公开仓库"),
          cacheNote
        );
      }

      var userField = React.createElement("div", { className: "ghmcp-user" },
        React.createElement("input", {
          className: "ghmcp-user__input",
          placeholder: "输入 GitHub 用户名（你当前账号可在对话里用 gh_current_user 查到）",
          value: username,
          onChange: function (e) { setUsername(e.target.value); },
          onKeyDown: function (e) { if (e.key === "Enter") loadStats(username, true); }
        }),
        React.createElement("button", { className: "ghmcp-user__btn", onClick: function () { loadStats(username, true); } }, "查询")
      );

      return React.createElement("div", { className: "ghmcp-page" },
        React.createElement("div", { className: "ghmcp-page__head" },
          React.createElement("span", { className: "ghmcp-page__logo" }, "🐙"),
          React.createElement("div", null,
            React.createElement("div", { className: "ghmcp-page__title" }, "连接 GitHub"),
            React.createElement("div", { className: "ghmcp-page__desc" }, "在 GitHub 上克隆、推送代码，查看和管理仓库与 Pull Request，用自然语言完成代码协作。")
          )
        ),
        React.createElement("div", { className: "ghmcp-page__status" }, "通过宿主侧接入 GitHub MCP → 工具以 mcp__github__* 形式出现。点示例可复制；克隆量/私有仓库请在对话里问。若 mcp__github__* 没出现，先在对话里运行 github_token_status 确认 token，然后重启 DSH。"),
        userField,
        statsEl,
        React.createElement("div", { className: "ghmcp-page__bar" },
          React.createElement("span", { className: "ghmcp-page__label" }, "💡 试试这样用"),
          React.createElement("button", { className: "ghmcp-page__shuffle", onClick: function () { setPicked(pickN(POOL, 4)); } }, "换一批"),
          React.createElement("span", { className: "ghmcp-page__count" }, "从 " + POOL.length + " 条随机 4 条")
        ),
        React.createElement("div", null, promptEls),
        React.createElement("div", { className: "ghmcp-copied" }, copied ? "已复制：点击示例已复制到剪贴板" : "")
      );
    }

    function apply(ctx) {
      var style = document.createElement("style");
      style.textContent = CSS;
      document.head.appendChild(style);

      var slots = ctx.get("slots");
      if (slots === undefined) {
        return function () { style.remove(); };
      }

      var disposeTab = slots.inject("settings.plugins.tab", function () {
        var unregister = slots.register(
          {
            name: "settings.plugins.tab",
            id: "mcp-github-hint",
            order: 20,
            label: function () { return "GitHub MCP"; }
          },
          function () { return React.createElement(GitHubHint, null); }
        );
        return function () { unregister(); };
      });

      return function () {
        disposeTab();
        style.remove();
      };
    }

    return { name: "dsh-github-mcp-hint", inject: ["slots"], apply: apply };
  }
});