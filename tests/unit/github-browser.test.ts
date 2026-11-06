// Pushing to GitHub from the browser with a pasted token (components/shelf/github.ts): it makes the
// repository when the token may, asks the learner to make it when it may not, starts an empty one
// with its README, puts everything else in one commit, and says plainly what went wrong.
import { describe, expect, it } from "vitest";
import { PushError, base64, newRepoUrl, pushFiles, whoIs } from "@/components/shelf/github";

type Handler = (method: string, path: string, body: unknown) => [number, unknown];

function fakeGitHub(handle: Handler) {
  const calls: { method: string; path: string; body: unknown; auth: string | null }[] = [];
  const fetcher = (async (url: string, init: RequestInit = {}) => {
    const path = new URL(url).pathname;
    const method = init.method ?? "GET";
    const body = init.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ method, path, body, auth: new Headers(init.headers).get("authorization") });
    const [status, reply] = handle(method, path, body);
    return new Response(JSON.stringify(reply), { status });
  }) as typeof fetch;
  return { fetcher, calls };
}

const files = { "README.md": "# My projects\n", "act-1/shop-sign/main.py": 'print("Open")\n', "act-1/bill-splitter/main.py": "print('£12.50 each')\n" };
const push = (fetcher: typeof fetch) => pushFiles({ token: "github_pat_x", login: "ruth", name: "ruth-python", description: "Programs I wrote.", message: "From the course", files }, fetcher);
const repo = { name: "ruth-python", owner: { login: "ruth" }, default_branch: "main", html_url: "https://github.com/ruth/ruth-python" };

/** A repository with one commit, answering the git calls. */
const gitCalls: Handler = (method, path) => {
  if (path.endsWith("/git/ref/heads/main")) return [200, { object: { sha: "c1" } }];
  if (path.endsWith("/git/commits/c1")) return [200, { tree: { sha: "t1" } }];
  if (path.endsWith("/git/trees")) return [201, { sha: "t2" }];
  if (path.endsWith("/git/commits") && method === "POST") return [201, { sha: "c2" }];
  if (path.endsWith("/git/refs/heads/main") && method === "PATCH") return [200, {}];
  return [500, { message: `unexpected ${method} ${path}` }];
};

describe("pushing from the browser", () => {
  it("puts every file in one tree and one commit on a repository that's there", async () => {
    const gh = fakeGitHub((m, p, b) => (p === "/repos/ruth/ruth-python" ? [200, repo] : gitCalls(m, p, b)));
    expect(await push(gh.fetcher)).toBe("https://github.com/ruth/ruth-python");
    const tree = gh.calls.find((c) => c.path.endsWith("/git/trees"))!.body as { base_tree: string; tree: { path: string; content: string; mode: string }[] };
    expect(tree.base_tree).toBe("t1");
    expect(tree.tree.map((t) => t.path).sort()).toEqual(Object.keys(files).sort());
    expect(tree.tree.every((t) => t.mode === "100644" && t.content === files[t.path as keyof typeof files])).toBe(true);
    expect(gh.calls.find((c) => c.path.endsWith("/git/commits") && c.method === "POST")!.body).toEqual({ message: "From the course", tree: "t2", parents: ["c1"] });
    expect(gh.calls.every((c) => c.auth === "Bearer github_pat_x")).toBe(true);
    expect(gh.calls.some((c) => c.path === "/user/repos")).toBe(false);
  });

  it("makes the repository when there isn't one and the token may", async () => {
    const gh = fakeGitHub((m, p, b) => (p === "/repos/ruth/ruth-python" ? [404, {}] : p === "/user/repos" ? [201, repo] : gitCalls(m, p, b)));
    expect(await push(gh.fetcher)).toBe("https://github.com/ruth/ruth-python");
    expect(gh.calls.find((c) => c.path === "/user/repos")!.body).toEqual({ name: "ruth-python", description: "Programs I wrote.", private: false, auto_init: true });
  });

  it("asks the learner to make it when a Contents-only token can't", async () => {
    const gh = fakeGitHub((_m, p) => (p === "/repos/ruth/ruth-python" ? [404, {}] : [403, { message: "Resource not accessible by personal access token" }]));
    const err = (await push(gh.fetcher).catch((e) => e)) as PushError;
    expect(err).toBeInstanceOf(PushError);
    expect(err.reason).toBe("no-repo");
    expect(err.makeUrl).toBe(newRepoUrl("ruth-python", "Programs I wrote."));
    expect(err.makeUrl).toContain("https://github.com/new?name=ruth-python");
  });

  it("starts an empty repository with its README, then commits the rest", async () => {
    let empty = true;
    const gh = fakeGitHub((m, p, b) => {
      if (p === "/repos/ruth/ruth-python") return [200, repo];
      if (p.endsWith("/git/ref/heads/main") && empty) return [409, { message: "Git Repository is empty." }];
      if (p.endsWith("/contents/README.md") && m === "PUT") {
        empty = false;
        return [201, {}];
      }
      return gitCalls(m, p, b);
    });
    expect(await push(gh.fetcher)).toBe("https://github.com/ruth/ruth-python");
    const put = gh.calls.find((c) => c.method === "PUT")!.body as { content: string; branch: string };
    expect(Buffer.from(put.content, "base64").toString("utf8")).toBe(files["README.md"]);
    expect(put.branch).toBe("main");
  });

  it("says plainly when the token is no good, or can't write there", async () => {
    const bad = fakeGitHub(() => [401, { message: "Bad credentials" }]);
    expect(((await push(bad.fetcher).catch((e) => e)) as PushError).reason).toBe("token");
    await expect(whoIs("nope", bad.fetcher)).rejects.toMatchObject({ reason: "token" });
    const readOnly = fakeGitHub((m, p, b) => (p === "/repos/ruth/ruth-python" ? [200, repo] : p.endsWith("/git/trees") ? [403, { message: "Resource not accessible" }] : gitCalls(m, p, b)));
    expect(((await push(readOnly.fetcher).catch((e) => e)) as PushError).reason).toBe("no-access");
    const offline = (async () => {
      throw new TypeError("Failed to fetch");
    }) as typeof fetch;
    expect(((await push(offline).catch((e) => e)) as PushError).reason).toBe("network");
  });

  it("refuses a name GitHub wouldn't take, and paths that climb out", async () => {
    const gh = fakeGitHub(() => [500, {}]);
    await expect(pushFiles({ token: "t", login: "ruth", name: "my projects!", description: "", message: "", files }, gh.fetcher)).rejects.toMatchObject({ reason: "name" });
    await expect(pushFiles({ token: "t", login: "ruth", name: "ok", description: "", message: "", files: { "../x": "y" } }, gh.fetcher)).rejects.toMatchObject({ reason: "name" });
    expect(gh.calls).toHaveLength(0);
  });

  it("asks who the token belongs to", async () => {
    const gh = fakeGitHub(() => [200, { login: "ruth" }]);
    expect(await whoIs("  github_pat_x  ", gh.fetcher)).toBe("ruth");
    expect(gh.calls[0]).toMatchObject({ method: "GET", path: "/user", auth: "Bearer github_pat_x" });
  });

  it("encodes any text as base64 the way GitHub reads it", () => {
    expect(base64("£12.50 each, Łukasz")).toBe(Buffer.from("£12.50 each, Łukasz", "utf8").toString("base64"));
  });
});
