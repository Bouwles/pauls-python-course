"use client";

// Who is here, and where their work is kept.
// Guests get a local-only store. Signed-in learners get a store that syncs,
// and any guest progress on this device is moved into their account.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { LocalStore, databaseExists } from "./local";
import { SyncEngine, type SyncStatus } from "./sync";
import { blankProfile, getProfile, updateProfile as saveProfile } from "./progress";
import type { ProfileRow } from "./types";
import { applyDisplaySettings } from "../display";

export interface SessionUser {
  id: string;
  email: string;
}

interface SessionValue {
  ready: boolean;
  /** For a signed-in learner: the server's copy has been pulled at least once on this device. */
  synced: boolean;
  user: SessionUser | null;
  store: LocalStore | null;
  profile: ProfileRow;
  syncStatus: SyncStatus;
  mode: "local" | "supabase";
  oauth: ("google" | "github")[];
  updateProfile: (patch: Partial<ProfileRow>) => Promise<void>;
  /** Re-check the session (after signing in) and move guest progress across. */
  refresh: () => Promise<SessionUser | null>;
  signOut: () => Promise<void>;
  flush: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

/** The first pull on a device decides what the learner sees, so give it a couple of tries. */
async function pullWithRetry(sync: SyncEngine, tries = 3): Promise<boolean> {
  for (let i = 0; i < tries; i++) {
    if (await sync.pull()) return true;
    await new Promise((r) => setTimeout(r, 600 * (i + 1)));
  }
  return false;
}

export function SessionProvider({ children, initialUser = null }: { children: React.ReactNode; initialUser?: SessionUser | null }) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [store, setStore] = useState<LocalStore | null>(null);
  const [profile, setProfile] = useState<ProfileRow>(blankProfile());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local");
  const [ready, setReady] = useState(false);
  const [synced, setSynced] = useState(false);
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [oauth, setOauth] = useState<("google" | "github")[]>([]);
  const syncRef = useRef<SyncEngine | null>(null);
  const storeRef = useRef<LocalStore | null>(null);

  const attachSeq = useRef(0);

  const attach = useCallback(async (next: SessionUser | null) => {
    const seq = ++attachSeq.current;
    const scope = next ? next.id : "guest";
    // Same person as before: keep the store (and anything subscribed to it).
    if (storeRef.current && storeRef.current.scope === scope) {
      if (next && syncRef.current) {
        if (await pullWithRetry(syncRef.current)) setSynced(true);
        void syncRef.current.flush();
      }
      setReady(true);
      return;
    }
    syncRef.current?.stop();
    syncRef.current = null;
    const previous = storeRef.current;

    const s = new LocalStore(scope);
    if (next && (await databaseExists("guest"))) {
      const guest = previous?.scope === "guest" ? previous : new LocalStore("guest");
      const moved = await s.absorb(guest);
      await guest.destroy();
      if (moved > 0) await s.queueEverything();
    } else if (previous && previous.scope !== scope) {
      await previous.close();
    }
    if (seq !== attachSeq.current) {
      // A newer attach has taken over.
      await s.close();
      return;
    }
    storeRef.current = s;
    if (next) {
      const sync = new SyncEngine(s);
      syncRef.current = sync;
      sync.subscribe(setSyncStatus);
      // On a new device the profile only exists after this pull; until it succeeds,
      // nothing should decide the learner is new (see MapView's welcome redirect).
      setSynced(await pullWithRetry(sync));
      void sync.flush();
    } else {
      setSyncStatus("local");
      setSynced(false);
    }
    setStore(s);
    const p = await getProfile(s);
    setProfile(p);
    applyDisplaySettings(p.settings);
    s.subscribe("profile", () => void getProfile(s).then(setProfile));
    setReady(true);
  }, []);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const body = (await res.json()) as { user: SessionUser | null; mode: "local" | "supabase"; oauth: ("google" | "github")[] };
    setMode(body.mode);
    setOauth(body.oauth);
    setUser(body.user);
    await attach(body.user);
    return body.user;
  }, [attach]);

  useEffect(() => {
    void refresh();
    return () => {
      syncRef.current?.stop();
    };
  }, [refresh]);

  const updateProfile = useCallback(async (patch: Partial<ProfileRow>) => {
    const s = storeRef.current;
    if (!s) return;
    const next = await saveProfile(s, patch);
    setProfile(next);
    if (patch.settings) applyDisplaySettings(next.settings);
  }, []);

  const flush = useCallback(async () => {
    await syncRef.current?.flush();
  }, []);

  const signOut = useCallback(async () => {
    await syncRef.current?.flush();
    syncRef.current?.stop();
    await fetch("/api/auth/logout", { method: "POST" });
    // Don't leave a learner's work on a shared computer.
    if (storeRef.current) await storeRef.current.destroy();
    storeRef.current = null;
    window.location.href = "/";
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ ready, synced, user, store, profile, syncStatus, mode, oauth, updateProfile, refresh, signOut, flush }),
    [ready, synced, user, store, profile, syncStatus, mode, oauth, updateProfile, refresh, signOut, flush],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession outside SessionProvider");
  return ctx;
}
