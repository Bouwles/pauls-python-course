// The site's owner, for owner-only pages: the emails in OWNER_EMAILS (comma separated).
import type { SessionUser } from "./auth";

export function isOwner(user: SessionUser | null): boolean {
  if (!user?.email) return false;
  const owners = (process.env.OWNER_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return owners.includes(user.email.toLowerCase());
}
