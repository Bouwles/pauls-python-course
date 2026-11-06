// The ppc companion tool (cli/) as a source package learners install with
// `pip install <site>/ppc.zip`, with the course's address written in as its default site. Served
// on request by app/ppc.zip/route.ts on the local version, and written as a plain file into the
// GitHub Pages build by scripts/build-pages.ts, where `pages` marks the copy as one for a course
// with no accounts (cli/src/ppc/_site.py): there, ppc runs the tests and prints a result to paste.
// Node only.
import fs from "node:fs";
import path from "node:path";
import { strToU8, zipSync } from "fflate";

export function ppcZip(site: string, { pages = false, root = process.cwd() }: { pages?: boolean; root?: string } = {}): { name: string; bytes: Uint8Array } {
  const cli = path.join(root, "cli");
  const files: Record<string, Uint8Array> = {};
  const version = /version = "([^"]+)"/.exec(fs.readFileSync(path.join(cli, "pyproject.toml"), "utf8"))?.[1] ?? "0.0.0";
  const top = `ppc-cli-${version}`;
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      if (name === "__pycache__" || name.startsWith(".") || name.endsWith(".egg-info")) continue;
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else {
        const rel = path.relative(cli, full).split(path.sep).join("/");
        let text = fs.readFileSync(full, "utf8");
        if (rel === "src/ppc/_site.py") text = `# The course site this copy of ppc was downloaded from.\nDEFAULT_SITE = ${JSON.stringify(site.replace(/\/$/, ""))}\n# ${pages ? "From the GitHub Pages version, which has no accounts: ppc test prints a result to paste." : "From a copy of the course with accounts."}\nSTATIC = ${pages ? "True" : "False"}\n`;
        files[`${top}/${rel}`] = strToU8(text);
      }
    }
  };
  walk(cli);
  return { name: `${top}.zip`, bytes: zipSync(files, { level: 6 }) };
}
