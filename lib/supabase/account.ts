"use client";

// The account itself, on GitHub Pages with accounts: a new password, and deleting it all.
import { supabase } from "./client";

/** Checks the current password first, so an unattended signed-in browser can't change it. An error to show, or null. */
export async function changePassword(current: string, next: string): Promise<string | null> {
  if (next.length < 10) return "Use at least 10 characters.";
  const { data } = await supabase().auth.getUser();
  const email = data.user?.email;
  if (!email) return "Log in again first.";
  const check = await supabase().auth.signInWithPassword({ email, password: current });
  if (check.error) return "That isn't your current password.";
  const { error } = await supabase().auth.updateUser({ password: next });
  if (error) return error.code === "same_password" ? "That's your current password, so pick a new one." : "That didn't work, give it another go in a moment.";
  return null;
}

/**
 * Deletes the account and everything saved with it. A browser can't delete an account by itself,
 * so this asks the delete-account Edge Function (supabase/functions), which deletes only the
 * account whose sign-in it's sent with. An error to show, or null.
 */
export async function deleteAccount(): Promise<string | null> {
  const { error } = await supabase().functions.invoke("delete-account", { method: "POST" });
  if (error) return "That didn't work, so try again in a moment, and if it keeps happening tell your teacher.";
  await supabase().auth.signOut({ scope: "local" });
  return null;
}
