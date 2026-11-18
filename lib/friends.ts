"use client";

// Friends, on GitHub Pages with accounts: ask by username, accept or turn down, unfriend, and see
// a friend's Shelf. Each call is one of the functions in supabase/migrations/0008, which only
// ever touch rows the signed-in learner is part of, and show a friend nothing they haven't shipped.
import { supabase } from "./supabase/client";

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  character: unknown;
  playAs: string | null;
  status: "pending" | "accepted";
  /** A request they sent you (true), or you sent them (false). */
  incoming: boolean;
  since: number;
}

export type AskResult = "sent" | "accepted" | "already" | "pending" | "not-found" | "self" | "signed-out";

export interface FriendProfile {
  id: string;
  username: string;
  displayName: string;
  character: unknown;
  playAs: string | null;
  joinedAt: number;
  shipped: { jobId: string; status: string; shippedAt: number | null }[];
}

export interface FriendFile {
  stepId: string;
  filename: string;
  content: string;
  updatedAt: number;
}

const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

export async function myFriends(): Promise<Friend[]> {
  const { data, error } = await supabase().rpc("my_friends");
  fail(error);
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    username: String(r.username ?? ""),
    displayName: String(r.display_name ?? "") || String(r.username ?? ""),
    character: r.character ?? null,
    playAs: (r.play_as as string | null) ?? null,
    status: r.status === "accepted" ? "accepted" : "pending",
    incoming: Boolean(r.incoming),
    since: Date.parse(String(r.since)) || 0,
  }));
}

export async function askFriend(username: string): Promise<AskResult> {
  const { data, error } = await supabase().rpc("request_friend", { wanted: username.trim().replace(/^@/, "") });
  fail(error);
  return data as AskResult;
}

export async function answerFriend(id: string, accept: boolean): Promise<boolean> {
  const { data, error } = await supabase().rpc("answer_friend", { other: id, accept });
  fail(error);
  return data === "accepted" || data === "declined";
}

export async function removeFriend(id: string): Promise<boolean> {
  const { data, error } = await supabase().rpc("remove_friend", { other: id });
  fail(error);
  return Boolean(data);
}

/** A friend's profile and what they've shipped; null if you aren't friends (or there's no such person). */
export async function friendProfile(username: string): Promise<FriendProfile | null> {
  const { data, error } = await supabase().rpc("friend_profile", { wanted: username });
  fail(error);
  if (!data) return null;
  const p = data as Record<string, unknown>;
  return {
    id: String(p.id),
    username: String(p.username ?? ""),
    displayName: String(p.displayName ?? "") || String(p.username ?? ""),
    character: p.character ?? null,
    playAs: (p.playAs as string | null) ?? null,
    joinedAt: Number(p.joinedAt ?? 0),
    shipped: ((p.shipped as Record<string, unknown>[] | null) ?? []).map((s) => ({ jobId: String(s.jobId), status: String(s.status), shippedAt: s.shippedAt === null || s.shippedAt === undefined ? null : Number(s.shippedAt) })),
  };
}

/** A friend's saved code for one project they've shipped, every step's. */
export async function friendCode(username: string, jobId: string): Promise<FriendFile[]> {
  const { data, error } = await supabase().rpc("friend_code", { wanted: username, job: jobId });
  fail(error);
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({ stepId: String(r.step_id), filename: String(r.filename), content: String(r.content ?? ""), updatedAt: Number(r.updated_at ?? 0) }));
}
