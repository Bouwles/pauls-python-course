---
id: investigate
type: investigate
title: The catalogue as it is
concept: with-statement
code: |
  with open("catalogue.csv") as catalogue:
      lines = catalogue.readlines()

  print(len(lines))
  print(lines[1])

  for line in lines[1:]:
      parts = line.split(",")
      print(parts[0], "by", parts[1])
tasks:
  - id: how-many
    prompt: "Run it. How many lines does the file have?"
    kind: answer
    accept: ["6", "six"]
    feedback: "Six: a header line with the column names, then five books."
    wrong: "It's the first number printed."
  - id: the-gap
    prompt: "There's an empty line after Emma's entry. Change `print(lines[1])` to `print(repr(lines[1]))` and run it. What two characters end the line?"
    kind: answer
    accept: ["\\n", "newline", "a newline", "new line", "a new line", "the newline"]
    feedback: "`\\n`, the newline. Each line read from a file keeps its own newline, and `print` adds another, so you see a gap. `.strip()` takes it off."
    wrong: "`repr` shows the hidden characters. Look at the end, just before the closing quote."
  - id: the-comma
    prompt: "Look at the third book in the loop's output. Who does it say wrote it?"
    kind: answer
    accept: ["Currents and the North Quay", "Currents and the North Quay\"", " Currents and the North Quay"]
    feedback: "The title has a comma in it, so splitting on commas cuts it in two. The file puts that title in quotes to protect it, but `split` knows nothing about quotes. The `csv` module does."
    wrong: "Copy the words after `by` on the third line of the loop's output."
---
`open()` opens a file. `with ... as catalogue:` keeps it open for the indented block and closes it when the block ends, even if something inside goes wrong. `.readlines()` reads every line into a list.

This is Mrs Vance's catalogue, `catalogue.csv`, the way Penhallow left it: one book per line, values separated by commas.
