import fs from "node:fs";
import path from "node:path";
import { strToU8, zipSync } from "fflate";
import { originOf } from "@/lib/server/http";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

/**
 * The ppc CLI as a source package (Section 10.5): `pip install <site>/ppc.zip`.
 * Built from /cli on request, with this site's address as the default, so the
 * tool talks to whichever deployment it was downloaded from.
 */
export async function GET(req: Request) {
  const root = path.join(process.cwd(), "cli");
  const files: Record<string, Uint8Array> = {};
  const version = /version = "([^"]+)"/.exec(fs.readFileSync(path.join(root, "pyproject.toml"), "utf8"))?.[1] ?? "0.0.0";
  const top = `${BRAND.townName.toLowerCase()}-cli-${version}`;
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      if (name === "__pycache__" || name.startsWith(".") || name.endsWith(".egg-info")) continue;
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else {
        const rel = path.relative(root, full).split(path.sep).join("/");
        let text = fs.readFileSync(full, "utf8");
        if (rel === "src/ppc/_site.py") text = `# The course site this copy of ppc was downloaded from.\nDEFAULT_SITE = ${JSON.stringify(originOf(req))}\n`;
        files[`${top}/${rel}`] = strToU8(text);
      }
    }
  };
  walk(root);
  return new Response(zipSync(files, { level: 6 }), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${top}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
