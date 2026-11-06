---
id: split
type: investigate
title: One line, three parts
concept: split-join
code: |
  line = "Aaesha, 01632 960733, The Engine Room"
  parts = line.split(", ")
  print(parts)
tasks:
  - id: count
    prompt: "Run it. How many items are in `parts`?"
    kind: answer
    accept: ["3", "three"]
    feedback: "Three. `.split(\", \")` cuts the text at every comma and space, and hands back the pieces as a list. The commas themselves are thrown away."
    wrong: "Count the items in the printed list, between the square brackets."
  - id: no-separator
    prompt: "Change line 2 to `parts = line.split()`, with nothing in the brackets, and run it. How many items now?"
    kind: answer
    accept: ["6", "six"]
    feedback: "Six. With nothing in the brackets, `.split()` cuts at every run of spaces, so the commas stay stuck to the words. Splitting a name into words is useful. Splitting a whole contact like this isn't."
    wrong: "Count the items in the printed list. Commas inside the quotes are part of an item."
  - id: words
    prompt: "Add a last line: `print(\"frame\" in \"Frame Shop\".split())`. What does it print?"
    kind: answer
    accept: ["False"]
    feedback: "False. `.split()` gives `['Frame', 'Shop']`, and `frame` with a small f isn't one of them. Capitals count, so lower the name first: `\"Frame Shop\".lower().split()`."
    wrong: "Copy the last line of the output exactly. It's True or False."
  - id: join
    prompt: "Change line 2 back to `parts = line.split(\", \")`. Then add a last line that joins the parts into one, with ` / ` between them, and prints `Aaesha / 01632 960733 / The Engine Room`."
    kind: run
    tests: |
      TESTS = [
          output("Joined with slashes", expect="Aaesha / 01632 960733 / The Engine Room", match="last_line",
                 hint="\" / \".join(parts) glues the list back into one string, with \" / \" between the pieces."),
      ]
    solution: |
      line = "Aaesha, 01632 960733, The Engine Room"
      parts = line.split(", ")
      print(parts)
      print(" / ".join(parts))
---
Aaesha's contact, typed on one line the way Riya will type new ones.
