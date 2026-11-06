import { getDb } from "@/lib/server/db";
import { issueCertificate, myCertificates } from "@/lib/server/certificates";
import { json, readJson, requireUser, sameOrigin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const WHY = {
  "not-finished": "Ship every main project in the Act first.",
  "no-act": "No such Act.",
} as const;

/** This learner's certificates. */
export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({ certificates: await myCertificates(await getDb(), user.id) });
}

/** Issue (or reissue with the current name) the certificate for an Act. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Bad origin." }, 403);
  const user = await requireUser();
  if (user instanceof Response) return user;
  const body = await readJson<{ actId?: unknown }>(req, 1_000);
  const actId = typeof body?.actId === "string" ? body.actId : "";
  const db = await getDb();
  const [profile] = await db.asService((q) => q<{ display_name: string | null }>("select display_name from public.profiles where id = $1", [user.id]));
  const result = await issueCertificate(db, user.id, actId, profile?.display_name ?? "");
  return result.ok ? json({ certificate: result.certificate }) : json({ error: WHY[result.reason] }, 400);
}
