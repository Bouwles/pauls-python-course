import { getTests } from "@/lib/content/server";
import { json } from "@/lib/server/http";

// Tests are fetched at Check time rather than shipped with the page. Checking
// runs in the learner's browser, so this is about keeping the brief clean,
// not secrecy; see DECISIONS.md.
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key") ?? "";
  if (!/^[a-z0-9-]+(\/[a-z0-9-]+){1,2}$/.test(key)) return json({ error: "Bad key." }, 400);
  const tests = getTests(key);
  return tests ? json({ tests }, 200, { "Cache-Control": "private, max-age=60" }) : json({ error: "No tests." }, 404);
}
