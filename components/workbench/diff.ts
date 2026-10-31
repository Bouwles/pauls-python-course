// A character-by-character difference between what a check expected and what it got, for
// highlighting both. The common start and end are trimmed first; the middle is compared with
// a longest-common-subsequence table, and when that would be too big (a long, wholly different
// output) the whole middle is marked instead.

export interface DiffPart {
  text: string;
  /** In both strings. */
  same: boolean;
}

const MAX_CELLS = 400_000;

function push(parts: DiffPart[], text: string, same: boolean) {
  if (!text) return;
  const last = parts[parts.length - 1];
  if (last && last.same === same) last.text += text;
  else parts.push({ text, same });
}

export function charDiff(expected: string, got: string): { expected: DiffPart[]; got: DiffPart[] } {
  let start = 0;
  while (start < expected.length && start < got.length && expected[start] === got[start]) start++;
  let endE = expected.length;
  let endG = got.length;
  while (endE > start && endG > start && expected[endE - 1] === got[endG - 1]) {
    endE--;
    endG--;
  }
  const a = expected.slice(start, endE);
  const b = got.slice(start, endG);
  const outE: DiffPart[] = [];
  const outG: DiffPart[] = [];
  push(outE, expected.slice(0, start), true);
  push(outG, got.slice(0, start), true);

  if (a.length * b.length > MAX_CELLS) {
    push(outE, a, false);
    push(outG, b, false);
  } else if (a.length && b.length) {
    // lcs[i][j]: the longest common subsequence of a[i:] and b[j:].
    const n = a.length;
    const m = b.length;
    const lcs = new Uint16Array((n + 1) * (m + 1));
    const at = (i: number, j: number) => i * (m + 1) + j;
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        lcs[at(i, j)] = a[i] === b[j] ? lcs[at(i + 1, j + 1)]! + 1 : Math.max(lcs[at(i + 1, j)]!, lcs[at(i, j + 1)]!);
      }
    }
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) {
        push(outE, a[i]!, true);
        push(outG, b[j]!, true);
        i++;
        j++;
      } else if (lcs[at(i + 1, j)]! >= lcs[at(i, j + 1)]!) {
        push(outE, a[i]!, false);
        i++;
      } else {
        push(outG, b[j]!, false);
        j++;
      }
    }
    push(outE, a.slice(i), false);
    push(outG, b.slice(j), false);
  } else {
    push(outE, a, false);
    push(outG, b, false);
  }

  push(outE, expected.slice(endE), true);
  push(outG, got.slice(endG), true);
  return { expected: outE, got: outG };
}

/** Where the two first differ, as "line 2, character 14" (both counted from 1). */
export function firstDifference(expected: string, got: string): { line: number; column: number } | null {
  if (expected === got) return null;
  let i = 0;
  while (i < expected.length && i < got.length && expected[i] === got[i]) i++;
  const before = expected.slice(0, i);
  const line = before.split("\n").length;
  const column = i - before.lastIndexOf("\n");
  return { line, column };
}
