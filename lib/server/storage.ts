// Stored files: uploaded Take It Home projects.
// Production: a private Supabase Storage bucket, "submissions".
// Local development: files under .data/uploads.
import fs from "node:fs";
import path from "node:path";
import { supabaseAdmin, supabaseEnabled } from "./auth";

const BUCKET = "submissions";
const localRoot = () => path.join(path.dirname(process.env.PPC_DB_DIR && process.env.PPC_DB_DIR !== "memory" ? process.env.PPC_DB_DIR : path.join(process.cwd(), ".data", "pglite")), "uploads");

/** Paths always start with the learner's id, so deleting an account can remove everything under it. */
export async function putFile(userId: string, name: string, data: Uint8Array, type = "application/zip"): Promise<string> {
  const key = `${userId}/${name.replace(/[^a-zA-Z0-9._/-]/g, "_")}`;
  if (supabaseEnabled() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = await supabaseAdmin();
    const { error } = await admin.storage.from(BUCKET).upload(key, data, { contentType: type, upsert: true });
    if (error) throw new Error(error.message);
    return key;
  }
  const file = path.join(localRoot(), key);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  return key;
}

export async function removeUserFiles(userId: string): Promise<void> {
  if (supabaseEnabled() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = await supabaseAdmin();
    // Storage has no recursive delete: list each folder and remove what is in it.
    const walk = async (prefix: string): Promise<string[]> => {
      const { data } = await admin.storage.from(BUCKET).list(prefix, { limit: 1000 });
      const out: string[] = [];
      for (const item of data ?? []) {
        const p = `${prefix}/${item.name}`;
        if (item.id) out.push(p);
        else out.push(...(await walk(p)));
      }
      return out;
    };
    const files = await walk(userId);
    for (let i = 0; i < files.length; i += 100) await admin.storage.from(BUCKET).remove(files.slice(i, i + 100));
    return;
  }
  fs.rmSync(path.join(localRoot(), userId), { recursive: true, force: true });
}
