---
id: make-quiz
type: make
title: Gwen's answer sheets
dialogue:
  - gwen: "Every Tuesday someone writes THE KRAKEN in capitals and argues for an hour."
on_pass: { gwen: "Kraken, the Kraken, THE KRAKEN. All right, and nobody can argue. They'll argue anyway." }
---
Teams hand Gwen one line of answers, separated by commas. Write three functions in `main.py`; the main block is written and uses them.

1. `tidy(answer)` gives back the answer in lower case, with spaces off both ends, every run of spaces inside squeezed to one, and a `the ` at the very start dropped.
2. `split_sheet(line)` gives back the list of tidied answers from one line. An empty answer between two commas stays in the list, as `""`.
3. `wrong_answers(sheet, answers)` gives back the list of question numbers, counting from 1, where the tidied answers differ. A sheet shorter than the answers got the missing ones wrong.

```
tidy("  The   Drowned  Anchor ")   gives  "drowned anchor"
split_sheet("Tom, 1987 ,,Kraken")  gives  ["tom", "1987", "", "kraken"]
```

The checks call each function with other values, and run the whole program.
