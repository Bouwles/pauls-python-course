// Pushing projects to GitHub straight from the browser, with a personal access token the learner
// pastes once (GitHubPush.tsx). There's no server on GitHub Pages to hold an OAuth app, but
// api.github.com answers browsers directly (it allows cross-origin requests with a token), so the
// page makes the repository and commits the files itself. The token is kept in this browser only,
// in localStorage under its own key: it isn't part of the progress store, so it never goes into a
// save file or a link, and it's sent to nowhere but api.github.com.
//
// A fine-grained token with only Contents (read and write) can commit to repositories but not make
// them, so when there's no repository by that name yet and the token can't make one, the learner
// is asked to make it on GitHub (with the name filled in) and push again. Pushing to an empty
// repository starts it with its README through the contents API, since the git API needs a commit
// to build on. Everything else goes in one tree and one commit.

export const TOKEN_KEY = "ppc-github-token";

export interface SavedToken {
  token: string;
  login: string;
}

export function loadToken(): SavedToken | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    const v = raw ? (JSON.parse(raw) as Partial<SavedToken>) : null;
    return v && typeof v.token === "string" && typeof v.login === "string" ? { token: v.token, login: v.login } : null;
  } catch {
    return null;
  }
}

export function saveToken(t: SavedToken): boolean {
  try {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(t));
    return true;
  } catch {
    return false;
  }
}

export function forgetToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing kept, nothing to forget.
  }
}

/** Repository names GitHub takes. */
export const REPO_NAME = /^[A-Za-z0-9._-]{1,100}$/;

/** What went wrong, in words for the learner, and what to do about it. */
export class PushError extends Error {
  constructor(
    message: string,
    public reason: "token" | "no-repo" | "no-access" | "name" | "network" | "github",
    /** For "no-repo": where to make it, with the name filled in. */
    public makeUrl?: string,
  ) {
    super(message);
  }
}

/** Where to make a repository on GitHub, with its name and description filled in. */
export const newRepoUrl = (name: string, description: string) => `https://github.com/new?${new URLSearchParams({ name, description, visibility: "public" })}`;

/** Where to make a fine-grained token. */
export const NEW_TOKEN_URL = "https://github.com/settings/personal-access-tokens/new";

/** UTF-8 text as standard base64, for the contents API. */
export function base64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

type Fetch = typeof fetch;

interface Reply<T> {
  status: number;
  body: T;
}

function client(token: string, fetcher: Fetch) {
  return async <T,>(method: string, path: string, body?: unknown): Promise<Reply<T>> => {
    let res: Response;
    try {
      res = await fetcher(`https://api.github.com${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new PushError("Couldn't reach GitHub. Check your connection and try again.", "network");
    }
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }
    if (res.status === 401) throw new PushError("GitHub didn't accept the token. It may have expired or been deleted: make a new one and paste it again.", "token");
    return { status: res.status, body: parsed as T };
  };
}

const said = (r: Reply<unknown>) => {
  const m = (r.body as { message?: unknown } | null)?.message;
  return typeof m === "string" ? `: ${m.slice(0, 160)}` : "";
};

/** Who the token belongs to: the login it pushes as. Throws if GitHub doesn't accept it. */
export async function whoIs(token: string, fetcher: Fetch = fetch): Promise<string> {
  const r = await client(token.trim(), fetcher)<{ login?: string }>("GET", "/user");
  if (r.status !== 200 || typeof r.body?.login !== "string") throw new PushError(`GitHub didn't accept the token (${r.status}${said(r)}).`, "token");
  return r.body.login;
}

/**
 * Put `files` in the repository `name` on the token's account, as one commit: making it first if
 * there isn't one and the token is allowed to, or into the one that's there. Returns its address.
 */
export async function pushFiles({ token, login, name, description, message, files }: { token: string; login: string; name: string; description: string; message: string; files: Record<string, string> }, fetcher: Fetch = fetch): Promise<string> {
  if (!REPO_NAME.test(name)) throw new PushError("Repository names use letters, numbers, dots, dashes and underscores.", "name");
  const paths = Object.keys(files).filter((p) => p && !p.startsWith("/") && !p.includes(".."));
  if (!paths.length) throw new PushError("There's nothing to push yet.", "name");
  const api = client(token, fetcher);
  const noAccess = () => new PushError(`This token can't write to ${login}/${name}. Check that it can reach that repository, with Contents set to Read and write.`, "no-access");

  // The repository: the one there, or a new one.
  let repo = await api<{ name: string; owner: { login: string }; default_branch: string; html_url: string; size?: number }>("GET", `/repos/${login}/${encodeURIComponent(name)}`);
  if (repo.status === 404) {
    const made = await api<typeof repo.body>("POST", "/user/repos", { name, description, private: false, auto_init: true });
    if (made.status === 201) repo = made;
    else if (made.status === 403 || made.status === 404) throw new PushError(`There's no repository called ${name} on ${login}'s GitHub yet, and this token isn't allowed to make one. Make it on GitHub, then push again.`, "no-repo", newRepoUrl(name, description));
    else if (made.status === 422) throw new PushError("GitHub wouldn't make a repository with that name. Pick another.", "name");
    else throw new PushError(`GitHub said no (${made.status}${said(made)}).`, "github");
  } else if (repo.status !== 200) throw new PushError(`GitHub said no (${repo.status}${said(repo)}).`, "github");
  const owner = repo.body.owner.login;
  const base = `/repos/${owner}/${encodeURIComponent(repo.body.name)}`;
  const branch = repo.body.default_branch || "main";

  // An empty repository has no commit to build on: start it with the README.
  let ref = await api<{ object: { sha: string } }>("GET", `${base}/git/ref/heads/${encodeURIComponent(branch)}`);
  if (ref.status === 404 || ref.status === 409) {
    const first = paths.includes("README.md") ? "README.md" : paths[0]!;
    const put = await api("PUT", `${base}/contents/${first.split("/").map(encodeURIComponent).join("/")}`, { message, content: base64(files[first]!), branch });
    if (put.status === 403 || put.status === 404) throw noAccess();
    if (put.status !== 201 && put.status !== 200) throw new PushError(`GitHub said no (${put.status}${said(put)}).`, "github");
    ref = await api<{ object: { sha: string } }>("GET", `${base}/git/ref/heads/${encodeURIComponent(branch)}`);
  }
  if (ref.status !== 200) throw new PushError(`GitHub said no (${ref.status}${said(ref)}).`, "github");
  const parent = await api<{ tree: { sha: string } }>("GET", `${base}/git/commits/${ref.body.object.sha}`);
  if (parent.status !== 200) throw new PushError(`GitHub said no (${parent.status}${said(parent)}).`, "github");

  // Every file in one tree, on top of what's there, and one commit.
  const tree = await api<{ sha: string }>("POST", `${base}/git/trees`, { base_tree: parent.body.tree.sha, tree: paths.map((path) => ({ path, mode: "100644", type: "blob", content: files[path] })) });
  if (tree.status === 403 || tree.status === 404) throw noAccess();
  if (tree.status !== 201) throw new PushError(`GitHub said no (${tree.status}${said(tree)}).`, "github");
  const commit = await api<{ sha: string }>("POST", `${base}/git/commits`, { message, tree: tree.body.sha, parents: [ref.body.object.sha] });
  if (commit.status !== 201) throw new PushError(`GitHub said no (${commit.status}${said(commit)}).`, "github");
  const moved = await api("PATCH", `${base}/git/refs/heads/${encodeURIComponent(branch)}`, { sha: commit.body.sha });
  if (moved.status === 403 || moved.status === 404) throw noAccess();
  if (moved.status !== 200) throw new PushError(`GitHub said no (${moved.status}${said(moved)}).`, "github");
  return repo.body.html_url;
}
