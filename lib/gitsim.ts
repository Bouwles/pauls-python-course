// A small, honest git for the browser (Act II, Version Control at the Workshop).
// Real commands, real behaviour for the parts a beginner meets: init, status,
// add, commit, log, diff, branch, checkout/switch, merge (fast-forward and
// three-way, with conflict markers), restore. State is plain JSON so it can be
// saved with the step and checked by the content.

export type Tree = Record<string, string>;

export interface Commit {
  id: string;
  parents: string[];
  message: string;
  tree: Tree;
  time: number;
}

export interface RepoState {
  initialised: boolean;
  files: Tree; // working tree
  index: Tree; // staging area
  commits: Record<string, Commit>;
  branches: Record<string, string | null>;
  head: string; // branch name (no detached HEAD in this course)
  merging: { theirs: string; branch: string; conflicts: string[] } | null;
  clock: number;
}

export function newRepo(files: Tree): RepoState {
  return { initialised: false, files: { ...files }, index: {}, commits: {}, branches: {}, head: "main", merging: null, clock: 0 };
}

function hash(text: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    h1 = Math.imul(h1 ^ text.charCodeAt(i), 16777619) >>> 0;
    h2 = Math.imul(h2 + text.charCodeAt(i), 2246822519) >>> 0;
  }
  return (h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0")).slice(0, 7);
}

const same = (a: Tree, b: Tree) => {
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && a[k] === b[k]);
};

function headCommit(s: RepoState): Commit | null {
  const id = s.branches[s.head];
  return id ? (s.commits[id] ?? null) : null;
}

function headTree(s: RepoState): Tree {
  return headCommit(s)?.tree ?? {};
}

function ancestors(s: RepoState, id: string | null): Set<string> {
  const out = new Set<string>();
  const stack = id ? [id] : [];
  while (stack.length) {
    const c = stack.pop()!;
    if (out.has(c)) continue;
    out.add(c);
    stack.push(...(s.commits[c]?.parents ?? []));
  }
  return out;
}

function mergeBase(s: RepoState, a: string, b: string): string | null {
  const ofA = ancestors(s, a);
  // Walk b's history breadth-first; the first commit also in a's history is the base.
  const queue = [b];
  const seen = new Set<string>();
  while (queue.length) {
    const c = queue.shift()!;
    if (seen.has(c)) continue;
    seen.add(c);
    if (ofA.has(c)) return c;
    queue.push(...(s.commits[c]?.parents ?? []));
  }
  return null;
}

/** A line diff (longest common subsequence), shown in the unified style. */
export function diffLines(a: string, b: string, nameA: string, nameB: string): string[] {
  const x = a === "" ? [] : a.replace(/\n$/, "").split("\n");
  const y = b === "" ? [] : b.replace(/\n$/, "").split("\n");
  const n = x.length;
  const m = y.length;
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i]![j] = x[i] === y[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
  const out = [`--- ${nameA}`, `+++ ${nameB}`];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && x[i] === y[j]) {
      out.push(` ${x[i]}`);
      i++;
      j++;
    } else if (j < m && (i >= n || dp[i]![j + 1]! >= dp[i + 1]![j]!)) {
      out.push(`+${y[j]}`);
      j++;
    } else {
      out.push(`-${x[i]}`);
      i++;
    }
  }
  return out;
}

function words(line: string): string[] {
  const out: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) out.push(m[1] ?? m[2] ?? m[3] ?? "");
  return out;
}

export interface Result {
  state: RepoState;
  output: string[];
  ok: boolean;
}

/** Run one command line. Returns the new state and what the terminal prints. */
export function exec(state: RepoState, line: string): Result {
  const s: RepoState = JSON.parse(JSON.stringify(state));
  const out: string[] = [];
  const fail = (msg: string): Result => ({ state, output: msg.split("\n"), ok: false });
  const argv = words(line.trim());
  if (argv.length === 0) return { state, output: [], ok: true };
  const [cmd, sub, ...rest] = argv;

  if (cmd === "ls") return { state, output: Object.keys(s.files).sort(), ok: true };
  if (cmd === "cat") {
    const f = sub ? s.files[sub] : undefined;
    return f === undefined ? fail(`cat: ${sub ?? ""}: No such file`) : { state, output: f.replace(/\n$/, "").split("\n"), ok: true };
  }
  if (cmd === "help") return { state, output: ["git init, status, add, commit -m, log, diff, branch, switch, checkout, merge, restore", "ls, cat <file>, clear"], ok: true };
  if (cmd !== "git") return fail(`${cmd}: command not found. Try git, ls or cat.`);
  if (!sub) return fail("usage: git <command>. Try git status.");
  if (sub !== "init" && !s.initialised) return fail("fatal: not a git repository (run git init first)");

  switch (sub) {
    case "init": {
      if (s.initialised) return { state, output: ["Reinitialized existing Git repository in /workshop/.git/"], ok: true };
      s.initialised = true;
      s.branches = { main: null };
      s.head = "main";
      s.index = {};
      return { state: s, output: ["Initialized empty Git repository in /workshop/.git/"], ok: true };
    }
    case "status": {
      const head = headTree(s);
      const staged: string[] = [];
      const unstaged: string[] = [];
      const untracked: string[] = [];
      const all = new Set([...Object.keys(head), ...Object.keys(s.index), ...Object.keys(s.files)]);
      for (const f of [...all].sort()) {
        const inHead = f in head;
        const inIndex = f in s.index;
        const inWork = f in s.files;
        if (inIndex && (!inHead || head[f] !== s.index[f])) staged.push(`${inHead ? "modified" : "new file"}:   ${f}`);
        if (!inIndex && inHead) staged.push(`deleted:    ${f}`);
        if (inIndex && inWork && s.files[f] !== s.index[f]) unstaged.push(`modified:   ${f}`);
        if (inIndex && !inWork) unstaged.push(`deleted:    ${f}`);
        if (!inIndex && !inHead && inWork) untracked.push(f);
      }
      out.push(`On branch ${s.head}`);
      if (s.merging) out.push(s.merging.conflicts.length ? "You have unmerged paths. Fix the conflicts, then git add and git commit." : "All conflicts fixed but you are still merging. Use git commit to finish.");
      if (!headCommit(s)) out.push("", "No commits yet");
      if (staged.length) out.push("", "Changes to be committed:", ...staged.map((x) => `\t${x}`));
      if (unstaged.length) out.push("", "Changes not staged for commit:", ...unstaged.map((x) => `\t${x}`));
      if (untracked.length) out.push("", "Untracked files:", ...untracked.map((x) => `\t${x}`));
      if (!staged.length && !unstaged.length && !untracked.length) out.push("nothing to commit, working tree clean");
      return { state, output: out, ok: true };
    }
    case "add": {
      if (!rest.length && !sub) return fail("Nothing specified, nothing added.");
      const targets = rest.length ? rest : [];
      if (!targets.length) return fail("Nothing specified, nothing added.\nMaybe you wanted to say 'git add .'?");
      const paths = targets.includes(".") || targets.includes("-A") ? [...new Set([...Object.keys(s.files), ...Object.keys(s.index)])] : targets;
      for (const p of paths) {
        if (p in s.files) s.index[p] = s.files[p]!;
        else if (p in s.index) delete s.index[p];
        else return fail(`fatal: pathspec '${p}' did not match any files`);
        if (s.merging) s.merging.conflicts = s.merging.conflicts.filter((c) => c !== p || /^(<{7}|={7}|>{7})/m.test(s.files[p] ?? ""));
      }
      if (s.merging) {
        const stillMarked = s.merging.conflicts.filter((c) => /^(<{7}|={7}|>{7})/m.test(s.index[c] ?? ""));
        s.merging.conflicts = stillMarked;
      }
      return { state: s, output: [], ok: true };
    }
    case "commit": {
      const mi = rest.indexOf("-m");
      const am = rest.indexOf("-am");
      if (am >= 0) {
        for (const p of Object.keys(s.index)) if (p in s.files) s.index[p] = s.files[p]!;
      }
      const msgAt = mi >= 0 ? mi : am;
      const message = msgAt >= 0 ? rest[msgAt + 1] : undefined;
      if (!message) return fail("Aborting commit due to empty commit message. Use git commit -m \"what you changed\".");
      if (s.merging && s.merging.conflicts.length) return fail(`error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the editor, then git add them.\n${s.merging.conflicts.map((c) => `\t${c}`).join("\n")}`);
      if (Object.values(s.index).some((c) => /^(<{7}|>{7})/m.test(c))) return fail("error: a file still has conflict markers (<<<<<<< and >>>>>>>). Remove them, then git add it again.");
      const parent = s.branches[s.head] ?? null;
      if (!s.merging && same(s.index, headTree(s))) return fail(headCommit(s) ? "nothing to commit, working tree clean" : "nothing added to commit but untracked files present (use \"git add\" to track)");
      s.clock += 1;
      const parents = [parent, s.merging?.theirs].filter((p): p is string => Boolean(p));
      const id = hash(JSON.stringify({ parents, message, tree: s.index, t: s.clock }));
      s.commits[id] = { id, parents, message, tree: { ...s.index }, time: s.clock };
      s.branches[s.head] = id;
      const changed = Object.keys({ ...s.index, ...(parent ? s.commits[parent]!.tree : {}) }).filter((f) => s.index[f] !== (parent ? s.commits[parent]!.tree[f] : undefined)).length;
      out.push(`[${s.head}${parent ? "" : " (root-commit)"} ${id}] ${message}`, ` ${changed} file${changed === 1 ? "" : "s"} changed`);
      s.merging = null;
      return { state: s, output: out, ok: true };
    }
    case "log": {
      const oneline = rest.includes("--oneline");
      let c = headCommit(s);
      if (!c) return fail(`fatal: your current branch '${s.head}' does not have any commits yet`);
      while (c) {
        const labels = Object.entries(s.branches).filter(([, id]) => id === c!.id).map(([b]) => (b === s.head ? `HEAD -> ${b}` : b));
        const deco = labels.length ? ` (${labels.join(", ")})` : "";
        if (oneline) out.push(`${c.id}${deco} ${c.message}`);
        else out.push(`commit ${c.id}${deco}`, ...(c.parents.length > 1 ? [`Merge: ${c.parents.join(" ")}`] : []), "", `    ${c.message}`, "");
        c = c.parents[0] ? (s.commits[c.parents[0]] ?? null) : null;
      }
      return { state, output: out, ok: true };
    }
    case "diff": {
      const staged = rest.includes("--staged") || rest.includes("--cached");
      const a = staged ? headTree(s) : s.index;
      const b = staged ? s.index : s.files;
      for (const f of [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()) {
        if (!staged && !(f in s.index)) continue; // untracked files aren't diffed
        if (a[f] === b[f]) continue;
        out.push(`diff --git a/${f} b/${f}`, ...diffLines(a[f] ?? "", b[f] ?? "", f in a ? `a/${f}` : "/dev/null", f in b ? `b/${f}` : "/dev/null"));
      }
      return { state, output: out, ok: true };
    }
    case "branch": {
      const name = rest[0];
      if (!name) return { state, output: Object.keys(s.branches).sort().map((b) => `${b === s.head ? "*" : " "} ${b}`), ok: true };
      if (rest.includes("-d")) {
        const target = rest.find((r) => r !== "-d")!;
        if (target === s.head) return fail(`error: Cannot delete branch '${target}' checked out`);
        if (!(target in s.branches)) return fail(`error: branch '${target}' not found.`);
        delete s.branches[target];
        return { state: s, output: [`Deleted branch ${target}.`], ok: true };
      }
      if (!headCommit(s)) return fail("fatal: Not a valid object name: 'main'. Make a first commit before branching.");
      if (name in s.branches) return fail(`fatal: a branch named '${name}' already exists`);
      if (!/^[A-Za-z0-9._/-]+$/.test(name)) return fail(`fatal: '${name}' is not a valid branch name`);
      s.branches[name] = s.branches[s.head]!;
      return { state: s, output: [], ok: true };
    }
    case "checkout":
    case "switch": {
      const create = rest[0] === "-b" || rest[0] === "-c";
      const name = create ? rest[1] : rest[0];
      if (!name) return fail(`usage: git ${sub} <branch>`);
      if (sub === "checkout" && name === "--") return execRestore(s, rest.slice(1), state);
      if (create) {
        const r = exec(state, `git branch ${name}`);
        if (!r.ok) return r;
        Object.assign(s, JSON.parse(JSON.stringify(r.state)));
      } else if (!(name in s.branches)) {
        if (name in s.files) return execRestore(s, [name], state);
        return fail(`error: pathspec '${name}' did not match any branch. Create it with git switch -c ${name}.`);
      }
      if (s.merging) return fail("error: you need to finish or abort the merge first.");
      const target = s.commits[s.branches[name]!]?.tree ?? {};
      const dirty = Object.keys({ ...s.files, ...s.index }).filter((f) => s.files[f] !== s.index[f] || s.index[f] !== headTree(s)[f]);
      const clash = dirty.filter((f) => target[f] !== headTree(s)[f]);
      if (clash.length) return fail(`error: Your local changes to the following files would be overwritten:\n${clash.map((c) => `\t${c}`).join("\n")}\nCommit your changes or stash them before you switch branches.`);
      // Carry uncommitted changes across, as git does when there's no clash.
      const carried: Tree = {};
      for (const f of dirty) if (f in s.files) carried[f] = s.files[f]!;
      s.head = name;
      s.files = { ...target, ...carried };
      s.index = { ...target };
      for (const f of dirty) if (f in s.index && !(f in carried)) delete s.index[f];
      return { state: s, output: [create ? `Switched to a new branch '${name}'` : `Switched to branch '${name}'`], ok: true };
    }
    case "merge": {
      const name = rest[0];
      if (!name) return fail("usage: git merge <branch>");
      if (rest.includes("--abort")) {
        if (!s.merging) return fail("fatal: There is no merge to abort.");
        s.files = { ...headTree(s) };
        s.index = { ...headTree(s) };
        s.merging = null;
        return { state: s, output: [], ok: true };
      }
      if (!(name in s.branches)) return fail(`merge: ${name} - not something we can merge`);
      const ours = s.branches[s.head]!;
      const theirs = s.branches[name]!;
      if (!same(s.files, s.index) || !same(s.index, headTree(s))) return fail("error: Your local changes would be overwritten by merge. Commit them first.");
      if (ours === theirs || ancestors(s, ours).has(theirs)) return { state, output: ["Already up to date."], ok: true };
      if (ancestors(s, theirs).has(ours)) {
        s.branches[s.head] = theirs;
        s.files = { ...s.commits[theirs]!.tree };
        s.index = { ...s.commits[theirs]!.tree };
        return { state: s, output: [`Updating ${ours}..${theirs}`, "Fast-forward"], ok: true };
      }
      const base = s.commits[mergeBase(s, ours, theirs) ?? ""]?.tree ?? {};
      const o = s.commits[ours]!.tree;
      const t = s.commits[theirs]!.tree;
      const merged: Tree = {};
      const conflicts: string[] = [];
      for (const f of [...new Set([...Object.keys(base), ...Object.keys(o), ...Object.keys(t)])].sort()) {
        const b = base[f];
        const x = o[f];
        const y = t[f];
        if (x === y) {
          if (x !== undefined) merged[f] = x;
        } else if (x === b) {
          if (y !== undefined) merged[f] = y;
        } else if (y === b) {
          if (x !== undefined) merged[f] = x;
        } else {
          conflicts.push(f);
          merged[f] = `<<<<<<< HEAD\n${(x ?? "").replace(/\n$/, "")}\n=======\n${(y ?? "").replace(/\n$/, "")}\n>>>>>>> ${name}\n`;
        }
      }
      s.files = merged;
      if (conflicts.length) {
        s.index = { ...o };
        for (const f of Object.keys(merged)) if (!conflicts.includes(f)) s.index[f] = merged[f]!;
        s.merging = { theirs, branch: name, conflicts };
        return { state: s, output: [...conflicts.map((c) => `Auto-merging ${c}`), ...conflicts.map((c) => `CONFLICT (content): Merge conflict in ${c}`), "Automatic merge failed; fix conflicts and then commit the result."], ok: false };
      }
      s.index = { ...merged };
      s.clock += 1;
      const message = `Merge branch '${name}'`;
      const id = hash(JSON.stringify({ parents: [ours, theirs], message, tree: merged, t: s.clock }));
      s.commits[id] = { id, parents: [ours, theirs], message, tree: { ...merged }, time: s.clock };
      s.branches[s.head] = id;
      return { state: s, output: ["Merge made by the 'ort' strategy."], ok: true };
    }
    case "restore":
      return execRestore(s, rest, state);
    default:
      return fail(`git: '${sub}' is not a git command this workshop knows. Try git help... or just: init, status, add, commit, log, diff, branch, switch, merge, restore.`);
  }
}

function execRestore(s: RepoState, args: string[], original: RepoState): Result {
  const staged = args.includes("--staged");
  const files = args.filter((a) => !a.startsWith("-"));
  if (!files.length) return { state: original, output: ["fatal: you must specify path(s) to restore"], ok: false };
  for (const f of files) {
    if (staged) {
      const h = headTree(s)[f];
      if (h === undefined) delete s.index[f];
      else s.index[f] = h;
    } else if (f in s.index) s.files[f] = s.index[f]!;
    else return { state: original, output: [`error: pathspec '${f}' did not match any file(s) known to git`], ok: false };
  }
  return { state: s, output: [], ok: true };
}

// ---------------------------------------------------------------------------
// Checks for content: questions asked of the repository's state.
// ---------------------------------------------------------------------------

export type GitCheck =
  | { kind: "initialised" }
  | { kind: "commits"; min: number; branch?: string }
  | { kind: "branch-exists"; name: string }
  | { kind: "on-branch"; name: string }
  | { kind: "clean" }
  | { kind: "merged"; branch: string; into?: string }
  | { kind: "merge-commit" }
  | { kind: "file-contains"; file: string; text: string; committed?: boolean }
  | { kind: "no-conflict-markers" }
  | { kind: "message-matches"; pattern: string };

export function checkRepo(s: RepoState, c: GitCheck): boolean {
  switch (c.kind) {
    case "initialised":
      return s.initialised;
    case "commits": {
      const tip = s.branches[c.branch ?? s.head];
      return ancestors(s, tip ?? null).size >= c.min;
    }
    case "branch-exists":
      return c.name in s.branches;
    case "on-branch":
      return s.head === c.name;
    case "clean":
      return s.initialised && !s.merging && same(s.files, s.index) && same(s.index, headTree(s)) && Boolean(headCommit(s));
    case "merged": {
      const into = s.branches[c.into ?? "main"];
      const from = s.branches[c.branch];
      return Boolean(into && from && ancestors(s, into).has(from));
    }
    case "merge-commit":
      return Object.values(s.commits).some((x) => x.parents.length > 1);
    case "file-contains": {
      const text = c.committed ? headTree(s)[c.file] : s.files[c.file];
      return (text ?? "").includes(c.text);
    }
    case "no-conflict-markers":
      return !Object.values(s.files).some((t) => /^(<{7}|={7}|>{7})/m.test(t));
    case "message-matches":
      return Object.values(s.commits).some((x) => new RegExp(c.pattern, "i").test(x.message));
  }
}
