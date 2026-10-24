import { describe, expect, it } from "vitest";
import { decrypt, encrypt, pushRepository } from "@/lib/server/github";

describe("pushing the Shelf to GitHub", () => {
  it("keeps tokens encrypted and reads them back", () => {
    process.env.GITHUB_CLIENT_SECRET = "test-secret";
    const blob = encrypt("gho_abc123");
    expect(blob).not.toContain("gho_abc123");
    expect(decrypt(blob)).toBe("gho_abc123");
  });

  it("creates the repository and commits every file in one commit", async () => {
    const calls: { method: string; path: string; body: unknown }[] = [];
    const fake = (async (url: string, init: RequestInit) => {
      const path = url.replace("https://api.github.com", "");
      const body = init.body ? JSON.parse(String(init.body)) : undefined;
      calls.push({ method: String(init.method), path, body });
      const reply = (data: unknown) => new Response(JSON.stringify(data), { status: 200 });
      if (path === "/user/repos") return reply({ name: "my-python-projects", owner: { login: "ada" }, default_branch: "main", html_url: "https://github.com/ada/my-python-projects" });
      if (path.endsWith("/git/ref/heads/main")) return reply({ object: { sha: "base" } });
      if (path.endsWith("/git/commits/base")) return reply({ tree: { sha: "basetree" } });
      if (path.endsWith("/git/blobs")) return reply({ sha: `blob${calls.length}` });
      if (path.endsWith("/git/trees")) return reply({ sha: "newtree" });
      if (path.endsWith("/git/commits")) return reply({ sha: "newcommit" });
      return reply({});
    }) as unknown as typeof fetch;
    const url = await pushRepository("token", "my-python-projects", "desc", { "README.md": "# Hi", "act-1/sign/main.py": "print('hi')" }, fake);
    expect(url).toBe("https://github.com/ada/my-python-projects");
    expect(calls.filter((c) => c.path.endsWith("/git/blobs"))).toHaveLength(2);
    const tree = calls.find((c) => c.path.endsWith("/git/trees"))!.body as { base_tree: string; tree: { path: string }[] };
    expect(tree.base_tree).toBe("basetree");
    expect(tree.tree.map((t) => t.path)).toEqual(["README.md", "act-1/sign/main.py"]);
    expect(calls.at(-1)).toMatchObject({ method: "PATCH", path: "/repos/ada/my-python-projects/git/refs/heads/main", body: { sha: "newcommit" } });
  });

  it("explains a name that's already taken", async () => {
    const fake = (async () => new Response("{}", { status: 422 })) as unknown as typeof fetch;
    await expect(pushRepository("token", "taken", "desc", { "a.py": "" }, fake)).rejects.toThrow(/already have a repository/);
  });
});
