import { describe, expect, it } from "vitest";
import { checkRepo, exec, newRepo, type RepoState } from "@/lib/gitsim";

function run(s: RepoState, ...lines: string[]) {
  let state = s;
  let last: string[] = [];
  for (const l of lines) {
    const r = exec(state, l);
    state = r.state;
    last = r.output;
  }
  return { state, last };
}

describe("the workshop's git", () => {
  it("refuses to work outside a repository, then initialises", () => {
    const s = newRepo({ "jobs.py": "print('jobs')\n" });
    expect(exec(s, "git status").output[0]).toMatch(/not a git repository/);
    const r = run(s, "git init", "git status");
    expect(r.last).toContain("Untracked files:");
    expect(checkRepo(r.state, { kind: "initialised" })).toBe(true);
  });

  it("stages, commits and logs", () => {
    const { state, last } = run(newRepo({ "jobs.py": "a\n" }), "git init", "git add .", 'git commit -m "First list of jobs"', "git log --oneline");
    expect(last[0]).toMatch(/^[0-9a-f]{7} \(HEAD -> main\) First list of jobs$/);
    expect(checkRepo(state, { kind: "clean" })).toBe(true);
    expect(exec(state, 'git commit -m "again"').output[0]).toBe("nothing to commit, working tree clean");
  });

  it("insists on a message", () => {
    const { state } = run(newRepo({ "a.py": "x\n" }), "git init", "git add a.py");
    expect(exec(state, "git commit").output[0]).toMatch(/empty commit message/);
  });

  it("shows a diff of unstaged changes", () => {
    let { state } = run(newRepo({ "a.py": "one\ntwo\n" }), "git init", "git add .", 'git commit -m "start"');
    state = { ...state, files: { "a.py": "one\nthree\n" } };
    const d = exec(state, "git diff").output;
    expect(d).toContain("-two");
    expect(d).toContain("+three");
  });

  it("branches, fast-forwards and merges", () => {
    let { state } = run(newRepo({ "a.py": "one\n" }), "git init", "git add .", 'git commit -m "start"', "git switch -c fog-horn");
    state = { ...state, files: { "a.py": "one\nfog\n" } };
    ({ state } = run(state, "git add a.py", 'git commit -m "Add the fog horn"', "git switch main"));
    expect(state.files["a.py"]).toBe("one\n");
    const merged = run(state, "git merge fog-horn");
    expect(merged.last).toContain("Fast-forward");
    expect(checkRepo(merged.state, { kind: "merged", branch: "fog-horn" })).toBe(true);
  });

  it("walks through a real conflict", () => {
    let { state } = run(newRepo({ "hours.py": "OPEN = 9\n" }), "git init", "git add .", 'git commit -m "start"', "git branch summer");
    state = { ...state, files: { "hours.py": "OPEN = 8\n" } };
    ({ state } = run(state, "git add .", 'git commit -m "Winter hours"', "git switch summer"));
    state = { ...state, files: { "hours.py": "OPEN = 7\n" } };
    ({ state } = run(state, "git add .", 'git commit -m "Summer hours"', "git switch main"));
    const m = exec(state, "git merge summer");
    expect(m.ok).toBe(false);
    expect(m.output.join("\n")).toMatch(/CONFLICT \(content\): Merge conflict in hours.py/);
    expect(m.state.files["hours.py"]).toMatch(/^<<<<<<< HEAD\nOPEN = 8\n=======\nOPEN = 7\n>>>>>>> summer\n$/);
    expect(exec(m.state, 'git commit -m "x"').ok).toBe(false);
    let fixed: RepoState = { ...m.state, files: { "hours.py": "OPEN = 8  # 7 in summer\n" } };
    ({ state: fixed } = run(fixed, "git add hours.py", 'git commit -m "Merge summer hours"'));
    expect(checkRepo(fixed, { kind: "merge-commit" })).toBe(true);
    expect(checkRepo(fixed, { kind: "merged", branch: "summer" })).toBe(true);
    expect(checkRepo(fixed, { kind: "no-conflict-markers" })).toBe(true);
  });

  it("won't switch branches over uncommitted work that would be lost", () => {
    let { state } = run(newRepo({ "a.py": "1\n" }), "git init", "git add .", 'git commit -m "s"', "git switch -c b");
    state = { ...state, files: { "a.py": "2\n" } };
    ({ state } = run(state, "git add .", 'git commit -m "two"', "git switch main"));
    state = { ...state, files: { "a.py": "3\n" } };
    expect(exec(state, "git switch b").output[0]).toMatch(/would be overwritten/);
  });
});
