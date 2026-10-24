import { forgetToken, githubEnabled, loadToken } from "@/lib/server/github";
import { json, requireUser, sameOrigin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** Whether pushing to GitHub is offered, and who it's connected as. */
export async function GET() {
  if (!githubEnabled()) return json({ enabled: false, connected: false });
  const user = await requireUser();
  if (user instanceof Response) return json({ enabled: true, connected: false });
  const token = await loadToken(user.id);
  return json({ enabled: true, connected: Boolean(token), login: token?.login ?? null });
}

/** Disconnect GitHub. */
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const user = await requireUser();
  if (user instanceof Response) return user;
  await forgetToken(user.id);
  return json({ ok: true });
}
