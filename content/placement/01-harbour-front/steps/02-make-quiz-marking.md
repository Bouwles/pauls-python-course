---
id: make-quiz
type: make
title: Paul's quiz sheets
dialogue:
  - paul: "Friday quiz. Someone always writes THE ZEN OF PYTHON in capitals and argues it's different."
on_pass: { paul: "Zen of Python, the Zen of Python, THE ZEN OF PYTHON. All marked the same. They'll argue anyway." }
---
Teams hand Paul one line of answers, separated by commas. Write three functions in `main.py`; the main block is written and uses them.

1. `tidy(answer)` gives back the answer in lower case, with spaces off both ends, every run of spaces inside squeezed to one, and a `the ` at the very start dropped.
2. `split_sheet(line)` gives back the list of tidied answers from one line. An empty answer between two commas stays in the list, as `""`.
3. `wrong_answers(sheet, answers)` gives back the list of question numbers, counting from 1, where the tidied answers differ. A sheet shorter than the answers got the missing ones wrong.

```
tidy("  The   Zen  of Python ")    gives  "zen of python"
split_sheet("Guido, 1991 ,,Zen")   gives  ["guido", "1991", "", "zen"]
```

The checks call each function with other values, and run the whole program.
