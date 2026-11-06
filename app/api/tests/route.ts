import { getTests } from "@/lib/content/server";
import { jobExists, jobOfKey } from "@/lib/server/gate";
import { json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

// Tests are fetched at Check time rather than shipped with the page. Checking
// runs in the learner's browser, so this is about keeping the brief clean,
// not secrecy.
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key") ?? "";
  if (!/^[a-z0-9-]+(\/[a-z0-9-]+){1,2}$/.test(key)) return json({ error: "Bad key." }, 400);
  if (!(await jobExists(jobOfKey(key)))) return json({ error: "No tests." }, 404);
  const tests = getTests(key);
  return tests ? json({ tests }, 200, { "Cache-Control": "private, max-age=60" }) : json({ error: "No tests." }, 404);
}
