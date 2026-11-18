"use client";

// On GitHub Pages with accounts (lib/supabase/project.ts), learning needs an account: anyone
// signed out who opens a page of the course is sent to log in, and comes back to it afterwards.
// The pages anyone may read stay open: the landing page, signing up and in, the syllabus, the
// handbook, the legal pages, and the links people share (a project, a Shelf, a certificate).
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { ACCOUNTS } from "@/lib/supabase/project";

const OPEN = [/^\/$/, /^\/about$/, /^\/login$/, /^\/signup$/, /^\/account(\/.*)?$/, /^\/syllabus$/, /^\/handbook(\/.*)?$/, /^\/privacy$/, /^\/terms$/, /^\/credits$/, /^\/share$/, /^\/certificate$/, /^\/404$/, /^\/_not-found$/];

/** Whether a page is open to someone signed out. */
export function isOpen(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return OPEN.some((re) => re.test(path));
}

export function AccountGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { ready, user } = useSession();
  const open = !ACCOUNTS || isOpen(pathname);
  const blocked = !open && ready && !user;

  useEffect(() => {
    if (!blocked) return;
    const next = `${pathname}${window.location.search}${window.location.hash}`;
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [blocked, pathname, router]);

  // Until we know who this is, a closed page shows nothing rather than someone else's empty desk.
  if (!open && (!ready || !user)) return <div aria-busy="true" style={{ minHeight: "100vh" }} />;
  return <>{children}</>;
}
