In Python, `strip()` removes whitespace (spaces, tabs and newlines) from both ends of a string, and `replace()` swaps one piece of text for another everywhere it appears. They are the two most common tools for cleaning text: `input().strip()` copes with someone typing ` yes ` with stray spaces, `line.strip()` removes the newline at the end of each line read from a file, and `price.replace("£", "")` removes a currency sign before the number is converted. Neither changes the original string; each hands back a cleaned copy for you to keep.

## How it works

`strip()` has two one-sided versions: `lstrip()` works on the left end only and `rstrip()` on the right. The bars here show where the spaces went:

```python
entry = "   Bea Rook   "
print("|" + entry.strip() + "|")
print("|" + entry.lstrip() + "|")
print("|" + entry.rstrip() + "|")
```

```text
|Bea Rook|
|Bea Rook   |
|   Bea Rook|
```

The space between the two words survives in all three. Stripping stops at the first character that isn't being removed, so it never reaches the middle.

When you pass an argument, as in `.strip(".,")`, it is read as a set of single characters to remove, in any order, not as a word. That catches people out when they try to remove an ending:

```python
filename = "report.txt"
print(filename.strip(".txt"))
print(filename.removesuffix(".txt"))
print("gale, gale, gale".replace("gale", "storm", 1))
```

```text
repor
report
storm, gale, gale
```

`.strip(".txt")` removes any `.`, `t` or `x` from either end, and keeps going while it finds them, so it takes the final `t` of `report` as well. To remove an exact ending or beginning, use `.removesuffix()` or `.removeprefix()`. The last line shows the optional third argument to `replace()`: a count, which limits how many matches are swapped, starting from the left.

## Common mistakes

- **Expecting `.strip()` to tidy the middle.** `"  Sea  Holly  ".strip()` gives `"Sea  Holly"`, with both inner spaces still there. To remove every space, use `.replace(" ", "")`. To squash runs of spaces down to one, use `" ".join(text.split())`.
- **Thinking `.replace()` changes only the first match.** It changes every one: `"a-b-c".replace("-", "")` is `"abc"`. Pass a count if you want fewer.
- **Expecting the string itself to change.** `reply.strip()` on a line of its own does the work and throws the answer away. Keep it: `reply = reply.strip()`, or strip as you read it with `reply = input("Again? ").strip()`.
- **Giving `.strip()` a word.** As shown above, its argument is a set of characters. Reach for `.removeprefix()` or `.removesuffix()` when you mean a whole word.

## Related

[split() and join()](/handbook/split-join) often comes straight after a strip, and [Strings can't be changed](/handbook/immutability) explains why both methods hand back a new string. Other everyday methods are in [String methods](/handbook/string-methods).
