---
id: learn-print
type: learn
title: print() shows words
concept: print
code: |
  print("Open at 9")
  print()
  print("Closed", "at 5")
---
`print()` is the instruction that shows something in the Output panel. You write `print`, then brackets, and inside them the words to show, in quotes. So `print("Open at 9")` shows:

```text
Open at 9
```

The word `print`, the brackets and the quotes are instructions to Python, so they don't appear. Only the words between the quotes do. That's the usual surprise: people expect the whole line to show.

Each `print()` shows one line, and the next one starts underneath. With nothing in the brackets, `print()` shows an empty line. With commas between several pieces of text, it shows them in a row, with a space between each: `print("Closed", "at 5")` shows `Closed at 5`.
