// Server-side checking (Section 12.4), behind an interface so it can be built later.
//
// TODO(PLAN.md, "deliberate stubs"): run uploaded Take It Home projects and capstone
// milestones in an isolated container job runner (no network, CPU and memory limits,
// a timeout) and compare its results with what the learner reported. Until then,
// results from the learner's own computer are trusted, and the Job page says so.

export interface SandboxRequest {
  userId: string;
  jobId: string;
  stepId: string;
  /** Storage key of the uploaded project zip. */
  projectKey: string | null;
}

export interface SandboxResult {
  status: "not-run" | "passed" | "failed" | "error";
  detail: string | null;
}

export async function verifySubmission(_req: SandboxRequest): Promise<SandboxResult> {
  return { status: "not-run", detail: null };
}
