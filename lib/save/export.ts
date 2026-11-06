// "Download all my data" without a server: the same zip the local version makes from /api/export
// (app/api/export/route.ts), built from what this browser holds. `<brand>-data.json` has the
// server's layout (account, exportedAt, the profile under its column names, then each table's
// rows with the server's fields) plus the classes kept in this browser, and every file of code
// sits beside it as code/<job>/<step>/<file>.
import { BRAND } from "../brand";
import { writeBook } from "../classes/store";
import { TABLE_SPECS, type TableSpec } from "../server/tables";
import { TABLES } from "../store/types";
import type { SaveData } from "./format";

/** A row as the server's export has it: its columns' fields, its key, and (for history) when it happened. */
function serverShape(spec: TableSpec, row: object): Record<string, unknown> {
  const r = row as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const col of spec.columns) out[col.field] = r[col.field] ?? null;
  out.key = spec.key(out);
  if (!spec.versioned) out.updatedAt = Number(out.createdAt ?? out.foundAt ?? out.setAt ?? out.reviewedAt ?? 0);
  return out;
}

/** The JSON half of the export, from this browser. No account here, so `account` is null. */
export function exportData(save: SaveData): Record<string, unknown> {
  const p = save.tables.profile[0];
  const out: Record<string, unknown> = {
    account: null,
    exportedAt: new Date(save.savedAt).toISOString(),
    profile: p
      ? {
          display_name: p.displayName,
          character: p.character,
          settings: p.settings,
          experience: p.experience,
          last_location: p.lastLocation,
          onboarded: p.onboarded,
          updated_at: p.updatedAt,
        }
      : null,
  };
  for (const table of TABLES) {
    if (table === "profile") continue;
    out[table] = save.tables[table].map((row) => serverShape(TABLE_SPECS[table], row));
  }
  out.classes = JSON.parse(writeBook(save.classes)) as unknown;
  return out;
}

const slug = BRAND.shortName.toLowerCase();

/** The zip's name and files. `server` is /api/export's answer when there's an account and it answered. */
export function exportFiles(save: SaveData, server: Record<string, unknown> | null = null): { name: string; files: Record<string, string> } {
  const data = server ? { ...server, classes: JSON.parse(writeBook(save.classes)) as unknown } : exportData(save);
  const files: Record<string, string> = {};
  for (const c of save.tables.code_files) files[`code/${c.jobId}/${c.stepId}/${c.filename}`] = c.content;
  files[`${slug}-data.json`] = JSON.stringify(data, null, 2);
  return { name: `${slug}-export.zip`, files };
}
