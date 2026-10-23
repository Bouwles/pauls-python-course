// Plain-language explanations shown under a traceback (Section 3.6).
// Each rule is written by hand. Rules are tried in order; the first match wins.
// They can look at the learner's code, so the same error can be explained
// differently depending on what led to it.
import type { PyError } from "./python/protocol";

export interface Explanation {
  /** One short line: what happened. */
  title: string;
  /** Two or three sentences: why, and where to look. */
  body: string;
}

interface Context {
  error: PyError;
  source: string;
  /** The source line the error points at, trimmed. */
  line: string;
  /** Names assigned straight from input() somewhere in the code. */
  inputNames: Set<string>;
}

type Rule = (c: Context) => Explanation | null;

const m = (re: RegExp, text: string) => re.exec(text);

function inputNames(source: string): Set<string> {
  const names = new Set<string>();
  for (const match of source.matchAll(/^\s*([A-Za-z_]\w*)\s*=\s*input\(/gm)) names.add(match[1]!);
  return names;
}

function namesIn(line: string): string[] {
  return [...line.matchAll(/[A-Za-z_]\w*/g)].map((x) => x[0]);
}

function usesInputValue(c: Context): string | null {
  for (const n of namesIn(c.line)) if (c.inputNames.has(n)) return n;
  return /input\(/.test(c.line) ? "input()" : null;
}

const rules: Rule[] = [
  // ---- SyntaxError and friends ----------------------------------------------
  (c) =>
    c.error.type === "SyntaxError" && /was never closed/.test(c.error.message)
      ? {
          title: "A bracket was opened and never closed.",
          body: `Count the opening and closing brackets on line ${c.error.line}. The ^ points at the one left open. Every ( needs a ), every [ needs a ].`,
        }
      : null,
  (c) =>
    c.error.type === "SyntaxError" && /unterminated (triple-quoted )?string literal/.test(c.error.message)
      ? {
          title: "A string starts but never ends.",
          body: "Check the quotes at each end of the text on that line. They have to match, and an apostrophe inside single quotes ends the string early. Double quotes outside let you use an apostrophe inside.",
        }
      : null,
  (c) =>
    c.error.type === "SyntaxError" && /expected ':'/.test(c.error.message)
      ? {
          title: "A colon is missing.",
          body: "Lines that start a block, like if, elif, else, for, while and def, end with a colon. The indented lines below belong to it.",
        }
      : null,
  (c) =>
    c.error.type === "SyntaxError" && /forgot a comma/.test(c.error.message)
      ? {
          title: "Two things are side by side with nothing between them.",
          body: "If they are separate values, put a comma between them. If they are meant to be text, they need quotes around them.",
        }
      : null,
  (c) =>
    c.error.type === "SyntaxError" && /'=' .*'=='|Maybe you meant '==' /.test(c.error.message)
      ? {
          title: "One equals sign where two were needed.",
          body: "A single = puts a label on a value. To ask whether two things are equal, use ==.",
        }
      : null,
  (c) =>
    c.error.type === "IndentationError" && /expected an indented block/.test(c.error.message)
      ? {
          title: "The line after a colon needs indenting.",
          body: "After a line ending in a colon, the lines that belong to it are indented four spaces. Python found nothing indented.",
        }
      : null,
  (c) =>
    c.error.type === "IndentationError" && /unexpected indent/.test(c.error.message)
      ? {
          title: "This line is indented, but nothing asked for it.",
          body: "Indenting means \"this belongs to the line above\". Line it up with the lines around it, unless it belongs inside an if or a loop.",
        }
      : null,
  (c) =>
    c.error.type === "IndentationError" || c.error.type === "TabError"
      ? {
          title: "The indentation doesn't line up.",
          body: "Each level of indentation is four spaces. This line doesn't match any level above it. The Tab key in the editor puts in four spaces for you.",
        }
      : null,
  (c) =>
    c.error.type === "SyntaxError"
      ? {
          title: "Python couldn't read this line.",
          body: `Nothing ran, because Python reads the whole file before running any of it. Look where the ^ points, and at the end of line ${Math.max(1, (c.error.line ?? 2) - 1)}: a bracket or quote left open there often shows up here.`,
        }
      : null,

  // ---- NameError --------------------------------------------------------------
  (c) => {
    if (c.error.type !== "NameError") return null;
    const name = m(/name '(\w+)' is not defined/, c.error.message)?.[1];
    const suggestion = m(/Did you mean: '(\w+)'/, c.error.message)?.[1];
    if (!name) return null;
    if (suggestion) {
      return {
        title: `Python doesn't know the name ${name}.`,
        body: `It suggests ${suggestion}. Names have to match exactly, capitals included.`,
      };
    }
    if (/^[A-Z][a-z]+$/.test(name) || /print\(\s*\w+\s*\)/.test(c.line)) {
      return {
        title: `Python doesn't know the name ${name}.`,
        body: `If ${name} is meant to be text, it needs quotes: "${name}". Without quotes, Python looks for a variable called ${name}.`,
      };
    }
    return {
      title: `Python doesn't know the name ${name}.`,
      body: `Either it's spelt differently where it was created, or this line runs before the line that gives ${name} a value. Programs run top to bottom.`,
    };
  },

  // ---- TypeError ----------------------------------------------------------------
  (c) => {
    if (c.error.type !== "TypeError" || !/can only concatenate str \(not "(int|float)"\) to str/.test(c.error.message)) return null;
    return {
      title: "+ is joining text to a number.",
      body: "+ joins text to text, or adds numbers to numbers, but not one of each. To make the number into text, use str() or an f-string.",
    };
  },
  (c) => {
    if (c.error.type !== "TypeError") return null;
    const textAndNumber =
      /unsupported operand type\(s\) for [^:]+: '(str)' and '(int|float)'|unsupported operand type\(s\) for [^:]+: '(int|float)' and '(str)'|can't multiply sequence by non-int of type 'float'|can only concatenate str \(not "(int|float)"\)/.test(
        c.error.message,
      );
    if (!textAndNumber) return null;
    const from = usesInputValue(c);
    if (from) {
      return {
        title: "A number is still text.",
        body: `input() always gives you text, even when someone types digits${from !== "input()" ? `, so ${from} holds text` : ""}. Turn it into a number with int() or float() before doing arithmetic.`,
      };
    }
    if (/can't multiply sequence by non-int of type 'float'/.test(c.error.message)) {
      return {
        title: "Text is being multiplied by a decimal.",
        body: "Text times a whole number repeats it, but text times a decimal makes no sense. One of these values is text when it should be a number.",
      };
    }
    return {
      title: "Arithmetic with text and a number.",
      body: "One side of the sum is text. Arithmetic needs numbers on both sides: int() or float() turns text into a number.",
    };
  },
  (c) =>
    c.error.type === "TypeError" && /'str' object cannot be interpreted as an integer/.test(c.error.message)
      ? {
          title: "A whole number was needed, and this is text.",
          body: "range() and friends need a whole number. If the value came from input(), wrap it in int() first.",
        }
      : null,
  (c) =>
    c.error.type === "TypeError" && /'NoneType'/.test(c.error.message)
      ? {
          title: "Something here is None.",
          body: "None means \"nothing\". A common cause is a function that prints its answer instead of returning it, so the caller gets None back.",
        }
      : null,
  (c) => {
    const f = m(/(\w+)\(\) takes (\d+) positional arguments? but (\d+) (?:was|were) given/, c.error.message);
    if (c.error.type !== "TypeError" || !f) return null;
    return {
      title: `${f[1]}() got a different number of values than it expects.`,
      body: `It is defined to take ${f[2]}, and this call gives it ${f[3]}. Check the brackets of the call against the def line. Inside a class, remember self.`,
    };
  },
  (c) =>
    c.error.type === "TypeError" && /object is not callable/.test(c.error.message)
      ? {
          title: "Brackets after something that isn't a function.",
          body: "Putting () after a name calls it. This name holds a value, not a function. Often a variable has been given the same name as a function, like print or sum.",
        }
      : null,
  (c) =>
    c.error.type === "TypeError"
      ? { title: "A value is the wrong type for this.", body: "Read the last line of the traceback for the two types involved. type(x) tells you what something really is." }
      : null,

  // ---- ValueError ---------------------------------------------------------------
  (c) => {
    const v = m(/invalid literal for int\(\) with base 10: '(.*)'/, c.error.message);
    if (c.error.type !== "ValueError" || !v) return null;
    const text = v[1]!;
    if (/^\s*-?\d+\.\d*\s*$/.test(text)) {
      return {
        title: `int() can't read "${text}".`,
        body: "int() only reads whole numbers. If decimals are allowed here, use float() instead.",
      };
    }
    if (text.trim() === "") {
      return { title: "int() was given empty text.", body: "Nothing was typed before Enter, so there was no number to read." };
    }
    return {
      title: `int() can't read "${text}".`,
      body: "int() only reads text made of digits, like \"42\". The value has the right type, text, but not a usable value. That's what a ValueError means.",
    };
  },
  (c) =>
    c.error.type === "ValueError" && /could not convert string to float/.test(c.error.message)
      ? { title: "float() can't read that text.", body: "float() reads numbers like \"2.5\" or \"7\". Anything else, including a stray letter, is a ValueError." }
      : null,
  (c) =>
    c.error.type === "ValueError"
      ? { title: "The right type, but a value that can't be used.", body: "The last line says which value. Compare a TypeError, where the type itself is wrong." }
      : null,

  // ---- Others ---------------------------------------------------------------------
  (c) =>
    c.error.type === "ZeroDivisionError"
      ? { title: "Something was divided by zero.", body: "Check what the bottom of the division is when it fails. Often it's a count that can be zero, like an empty list or no readings." }
      : null,
  (c) =>
    c.error.type === "IndexError"
      ? {
          title: "There's no item at that position.",
          body: "Positions start at 0, so a list of 3 items has positions 0, 1 and 2. Asking for position 3 goes past the end.",
        }
      : null,
  (c) => {
    if (c.error.type !== "KeyError") return null;
    return {
      title: `The dictionary has no key ${c.error.message}.`,
      body: "Check the spelling and capitals of the key. If it might be missing, .get(key, default) gives a fallback instead of crashing.",
    };
  },
  (c) => {
    const a = m(/'(\w+)' object has no attribute '(\w+)'/, c.error.message);
    if (c.error.type !== "AttributeError" || !a) return null;
    return {
      title: `A ${a[1]} has no ${a[2]}.`,
      body: `Check the spelling of ${a[2]}. If it should exist, check that the value really is the type you think. type() will tell you.`,
    };
  },
  (c) =>
    c.error.type === "RecursionError"
      ? { title: "A function kept calling itself.", body: "Every recursive function needs a base case: a situation where it stops calling itself. Check it can actually be reached." }
      : null,
  (c) =>
    c.error.type === "EOFError" || c.error.inputsExhausted
      ? { title: "The program asked for more input than it was given.", body: "Count the input() calls that run, including ones inside loops." }
      : null,
  (c) =>
    c.error.type === "ModuleNotFoundError"
      ? { title: "Python can't find that module.", body: "Check the spelling in the import line. For your own files, the file has to be in this Job." }
      : null,
  (c) =>
    c.error.type === "UnboundLocalError"
      ? {
          title: "A variable is used inside a function before it's set there.",
          body: "Assigning to a name anywhere inside a function makes it local to that function. Pass the value in as a parameter, or return the new value.",
        }
      : null,
];

export function explainError(error: PyError, source: string): Explanation | null {
  const lines = source.split("\n");
  const line = error.line && error.line <= lines.length ? lines[error.line - 1]!.trim() : (error.text ?? "").trim();
  const ctx: Context = { error, source, line, inputNames: inputNames(source) };
  for (const rule of rules) {
    const e = rule(ctx);
    if (e) return e;
  }
  return null;
}
