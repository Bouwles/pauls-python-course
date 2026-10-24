import { GitHubError, githubEnabled, loadToken, pushRepository } from "@/lib/server/github";
import { json, limited, readJson, requireUser, sameOrigin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const NAME = /^[A-Za-z0-9._-]{1,100}$/;

/** Push the Shelf (the same files as the repository export) to a new public repository. */
export async function POST(req: Request) {
  if (!githubEnabled()) return json({ error: "GitHub isn't set up on this site." }, 404);
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const tooMany = limited(req, "github-push", 5, 60_000);
  if (tooMany) return tooMany;
  const user = await requireUser();
  if (user instanceof Response) return user;
  const body = await readJson<{ name?: string; files?: Record<string, string> }>(req, 8_000_000);
  if (!body?.name || !NAME.test(body.name)) return json({ error: "Repository names use letters, numbers, dots, dashes and underscores." }, 400);
  const files = body.files ?? {};
  const paths = Object.keys(files);
  if (!paths.length || paths.length > 800 || paths.some((p) => p.startsWith("/") || p.includes(".."))) return json({ error: "Nothing sensible to push." }, 400);
  const token = await loadToken(user.id);
  if (!token) return json({ error: "Connect GitHub first." }, 401);
  try {
    const url = await pushRepository(token.token, body.name, "Programs I wrote in Paul's Python Course.", files);
    return json({ ok: true, url });
  } catch (err) {
    if (err instanceof GitHubError) return json({ error: err.message }, err.status);
    throw err;
  }
}
