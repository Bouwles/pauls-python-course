// The Supabase project the GitHub Pages site keeps accounts in. Both values are public by design:
// the publishable key only lets a browser do what row level security and the functions in
// supabase/migrations allow (0008 especially).
import { STATIC } from "../static";

// The course's own project (Mumbai, the nearest region to the class). An environment variable
// can point a build at another project, or switch accounts off with an empty value.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_PPC_SUPABASE_URL ?? "https://svcvvjzuhcljsxpjispa.supabase.co";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_PPC_SUPABASE_KEY ?? "sb_publishable_o_tGR8qGkGmivd4eBTSdcA__4oxX0oT";

/**
 * True when this is the GitHub Pages build with a Supabase project behind it: an account is
 * needed to learn, and progress, friends and classes live in Supabase. False in the local
 * version (which has its own server) and in a Pages build with no project configured.
 */
export const ACCOUNTS = STATIC && Boolean(SUPABASE_URL && SUPABASE_KEY);
