// Pushing the Shelf to a new GitHub repository, through the
// learner's own GitHub account (OAuth, scope public_repo). The token is stored
// encrypted, server side only.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getDb } from "./db";
import { BRAND } from "../brand";

export const githubEnabled = () => Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);

const key = () => createHash("sha256").update(`${process.env.GITHUB_CLIENT_SECRET ?? ""}:ppc-github-tokens`).digest();

export function encrypt(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), body].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(blob: string): string {
  const [iv, tag, body] = blob.split(".").map((p) => Buffer.from(p, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv!);
  decipher.setAuthTag(tag!);
  return Buffer.concat([decipher.update(body!), decipher.final()]).toString("utf8");
}

export async function saveToken(userId: string, token: string, login: string) {
  const db = await getDb();
  await db.asService((q) =>
    q("insert into public.github_tokens (user_id, token_enc, login) values ($1, $2, $3) on conflict (user_id) do update set token_enc = excluded.token_enc, login = excluded.login, created_at = now()", [userId, encrypt(token), login]),
  );
}

export async function loadToken(userId: string): Promise<{ token: string; login: string } | null> {
  const db = await getDb();
  const rows = await db.asService((q) => q<{ token_enc: string; login: string }>("select token_enc, login from public.github_tokens where user_id = $1", [userId]));
  if (!rows[0]) return null;
  try {
    return { token: decrypt(rows[0].token_enc), login: rows[0].login };
  } catch {
    return null;
  }
}

export async function forgetToken(userId: string) {
  const db = await getDb();
  await db.asService((q) => q("delete from public.github_tokens where user_id = $1", [userId]));
}

export class GitHubError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
  }
}

type Fetch = typeof fetch;

/** Create a public repository and commit every file to it in one commit. */
export async function pushRepository(token: string, name: string, description: string, files: Record<string, string>, fetcher: Fetch = fetch): Promise<string> {
  const api = async <T,>(method: string, path: string, body?: unknown): Promise<T> => {
    const res = await fetcher(`https://api.github.com${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", "User-Agent": BRAND.name.toLowerCase() },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      if (res.status === 422 && path === "/user/repos") throw new GitHubError("You already have a repository with that name. Pick another.", 409);
      if (res.status === 401) throw new GitHubError("GitHub didn't accept the connection. Connect it again.", 401);
      throw new GitHubError(`GitHub said no (${res.status}): ${text.slice(0, 200)}`, 502);
    }
    return (await res.json()) as T;
  };
  const repo = await api<{ name: string; owner: { login: string }; default_branch: string; html_url: string }>("POST", "/user/repos", { name, description, private: false, auto_init: true });
  const base = `/repos/${repo.owner.login}/${repo.name}`;
  const ref = await api<{ object: { sha: string } }>("GET", `${base}/git/ref/heads/${repo.default_branch}`);
  const parent = await api<{ tree: { sha: string } }>("GET", `${base}/git/commits/${ref.object.sha}`);
  const tree: { path: string; mode: string; type: string; sha: string }[] = [];
  for (const [path, content] of Object.entries(files)) {
    const blob = await api<{ sha: string }>("POST", `${base}/git/blobs`, { content: Buffer.from(content, "utf8").toString("base64"), encoding: "base64" });
    tree.push({ path, mode: "100644", type: "blob", sha: blob.sha });
  }
  const newTree = await api<{ sha: string }>("POST", `${base}/git/trees`, { base_tree: parent.tree.sha, tree });
  const commit = await api<{ sha: string }>("POST", `${base}/git/commits`, { message: `Everything on my Shelf, from ${BRAND.name}`, tree: newTree.sha, parents: [ref.object.sha] });
  await api("PATCH", `${base}/git/refs/heads/${repo.default_branch}`, { sha: commit.sha });
  return repo.html_url;
}
