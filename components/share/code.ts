// A shipped project's code, as the share links carry it: the files of the step it ships from, or
// a terminal (git) step's repository, which keeps its project inside the step's saved state.
import type { LocalStore } from "@/lib/store/local";
import type { Files } from "@/lib/python/protocol";
import type { SharedFile } from "@/lib/share-links";

export async function shippedCode(store: LocalStore, jobId: string, stepId: string): Promise<SharedFile[]> {
  const step = await store.get("step_progress", `${jobId}/${stepId}`);
  const repo = (step?.data?.git as { repo?: { files?: Files } } | undefined)?.repo?.files;
  const files: Files = repo ? { ...repo } : Object.fromEntries((await store.prefixed("code_files", `${jobId}/${stepId}/`)).map((r) => [r.filename, r.content]));
  return Object.entries(files)
    .map(([name, content]) => ({ name, content: String(content) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
