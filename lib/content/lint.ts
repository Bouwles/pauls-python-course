// Copy rules from Section 7.8 of the spec. Used by content validation and by
// scripts/copy-lint.ts for UI strings. Code (inline or fenced) is ignored.

const BANNED: [RegExp, string][] = [
  [/unlock (your|their)/i, "unlock your"],
  [/\bembark/i, "embark"],
  [/\bjourney/i, "journey"],
  [/level[- ]up/i, "level up"],
  [/\bdive in\b|\bdive into\b|let'?s dive/i, "dive in"],
  [/\bseamless/i, "seamless"],
  [/\bsupercharg/i, "supercharge"],
  [/\bempower/i, "empower"],
  [/\belevate/i, "elevate"],
  [/\bunleash/i, "unleash"],
  [/\brevolutioni[sz]e/i, "revolutionise"],
  [/game[- ]changer/i, "game-changer"],
  [/cutting[- ]edge/i, "cutting-edge"],
  [/fast-paced world/i, "in today's fast-paced world"],
  [/\bawesome\b/i, "awesome"],
  [/\bgreat job\b/i, "great job"],
  [/\bcoming soon\b/i, "coming soon"],
  [/\blorem ipsum\b/i, "lorem ipsum"],
  [/\bAI-powered\b/i, "AI-powered"],
];

const AMERICAN: [RegExp, string][] = [
  [/\bcolor(s|ed|ful)?\b/i, "colour"],
  [/\bfavorite/i, "favourite"],
  [/\borganiz/i, "organis"],
  [/\brecogniz/i, "recognis"],
  [/\bbehavior/i, "behaviour"],
  [/\bcenter(ed|s)?\b/i, "centre"],
  [/\bgray\b/i, "grey"],
  [/\banalyz/i, "analys"],
  [/\bneighbor/i, "neighbour"],
  [/\bcatalog\b/i, "catalogue"],
];

const EMOJI = /\p{Extended_Pictographic}/u;

// The old names (REDESIGN.md 1.1). Checked on the whole text, code included: they mustn't survive anywhere.
const OLD_NAMES = /saltmarsh|paul('|&apos;|’)?s python course|pauls-python-course/i;

export function stripCode(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`\n]*`/g, " ")
    .replace(/\{[^{}\n]*\}/g, " ");
}

export interface LintOptions {
  /** UI copy: no exclamation marks at all. Dialogue allows one per Job (checked elsewhere). */
  ui?: boolean;
  /** Check British spelling (content prose). */
  spelling?: boolean;
}

export function lintText(text: string, opts: LintOptions = {}): string[] {
  const problems: string[] = [];
  if (OLD_NAMES.test(text)) problems.push(`uses an old name ("${text.match(OLD_NAMES)![0]}"); write {{town}} in content, or BRAND from lib/brand.ts in code`);
  const prose = stripCode(text);
  if (/—|―/.test(prose)) problems.push("contains an em dash");
  if (/\s–\s/.test(prose)) problems.push("uses an en dash as a dash");
  if (EMOJI.test(prose)) problems.push("contains an emoji");
  for (const [re, label] of BANNED) if (re.test(prose)) problems.push(`uses a banned phrase ("${label}")`);
  if (opts.ui && /[A-Za-z0-9)"'’]!(\s|$|["'’])/.test(prose)) problems.push("has an exclamation mark");
  if (opts.ui && /\b[A-Z][a-z]+\. [A-Z][a-z]+\. [A-Z][a-z]+\.(\s|$)/.test(prose) && prose.trim().split(/\s+/).length <= 4) {
    problems.push("reads like a slogan triplet");
  }
  if (opts.spelling !== false) {
    // Python's own names keep their spelling: method calls (.center(), color=) and hyphenated ids (center-adds-width).
    const words = prose
      .replace(/\.?\b\w+\s*\(/g, " ") // calls: .center(
      .replace(/\b\w+=/g, " ") // keyword arguments: color=
      .replace(/\b\w+(?:\.\w+)+\b/g, " ") // dotted names: sklearn.neighbors
      .replace(/\b\w*[a-z][A-Z]\w*\b/g, " ") // CamelCase: KNeighborsClassifier
      .replace(/\b\w*_\w*\b/g, " ") // snake_case: n_neighbors
      .replace(/\b[a-z0-9]+(?:-[a-z0-9]+)+\b/g, " "); // ids: center-adds-width
    for (const [re, british] of AMERICAN) if (re.test(words)) problems.push(`American spelling (use "${british}")`);
  }
  return problems;
}
