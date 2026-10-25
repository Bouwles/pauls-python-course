// Building downloadable files from a learner's work: single programs, project
// zips, and the whole Shelf as a repository ready for GitHub.
import { strToU8, zipSync } from "fflate";
import type { Files } from "./python/protocol";
import { BRAND } from "./brand";

export interface ShelfItem {
  jobId: string;
  title: string;
  actNumber: number;
  actTitle: string;
  actId: string;
  number: number;
  client: string;
  building: string;
  shelf: { object: string; label: string };
  shipsFrom: string | null;
  files: string[];
  entry: string;
  spec: string;
  learned: string[];
  data: Files;
  /** The project's portfolio README template from content ({name}, {date}), when it has one. */
  portfolioReadme?: string | null;
}

export function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function projectFolder(item: ShelfItem) {
  return `act-${String(item.actNumber).padStart(2, "0")}-${slug(item.actTitle)}/${String(item.number).padStart(2, "0")}-${item.jobId}`;
}

export function readme(item: ShelfItem, shippedAt: number | null, name = ""): string {
  const date = shippedAt ? new Date(shippedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;
  // The project's own portfolio README (REDESIGN.md 7.1), with the learner's name and the date filled in.
  if (item.portfolioReadme) {
    const filled = item.portfolioReadme.replace(/\{name\}/g, name.trim() || "me").replace(/\{date\}/g, date ?? "recently").trim();
    return `${filled}\n\n---\n\nFor ${item.client}, ${BRAND.townName}. Act ${item.actNumber}, ${item.actTitle}, of ${BRAND.name}.\n`;
  }
  return [
    `# ${item.title}`,
    "",
    `For ${item.client}, ${BRAND.townName}.${date ? ` Shipped ${date}.` : ""} Act ${item.actNumber}, ${item.actTitle}, of ${BRAND.name}.`,
    "",
    "## The brief",
    "",
    item.spec.trim(),
    "",
    ...(item.learned.length ? ["## What it uses", "", ...item.learned.map((l) => `- ${l}`), ""] : []),
    "## Run it",
    "",
    "```",
    `python ${item.entry}`,
    "```",
    "",
  ].join("\n");
}

export function zip(files: Record<string, string>): Uint8Array {
  return zipSync(Object.fromEntries(Object.entries(files).map(([k, v]) => [k, strToU8(v)])), { level: 6 });
}

export function download(name: string, data: Uint8Array | string, type = "application/octet-stream") {
  const blob = new Blob([typeof data === "string" ? data : (data as unknown as BlobPart)], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function repoReadme(items: { item: ShelfItem; shippedAt: number | null }[], name: string): string {
  const byAct = new Map<string, { item: ShelfItem; shippedAt: number | null }[]>();
  for (const x of items) byAct.set(x.item.actTitle, [...(byAct.get(x.item.actTitle) ?? []), x]);
  const lines = [`# ${name ? `${name}'s` : "My"} Python projects`, "", `Programs I wrote for ${BRAND.name}: ${items.length} of them, each for someone in the town of ${BRAND.townName}.`, ""];
  for (const [act, xs] of byAct) {
    lines.push(`## ${act}`, "");
    for (const { item } of xs.sort((a, b) => a.item.number - b.item.number)) lines.push(`- [${item.title}](${projectFolder(item)}/): ${item.spec.split("\n")[0]}`);
    lines.push("");
  }
  return lines.join("\n");
}
