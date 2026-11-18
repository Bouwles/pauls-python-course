"use client";

// The home page on GitHub Pages with accounts: the landing page for anyone signed out, their
// Clocktower once they're in. Both are drawn at build time; this picks one in the browser. The
// built page shows the landing page (what search engines and first-time visitors get); someone
// who was signed in last time sees nothing for the moment it takes to be sure, not a flash of it.
import { useEffect, useState } from "react";
import { useSession, wasSignedIn } from "@/lib/store/session";

export function HomeSwitch({ landing, tower }: { landing: React.ReactNode; tower: React.ReactNode }) {
  const { ready, user } = useSession();
  const [hint, setHint] = useState(false);
  useEffect(() => setHint(wasSignedIn()), []);
  if (user) return <>{tower}</>;
  if (!ready && hint) return <div aria-busy="true" style={{ minHeight: "100vh" }} />;
  return <>{landing}</>;
}
