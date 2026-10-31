---
id: split
type: investigate
title: One line, three parts
concept: split-join
code: |
  line = "Riya, 01632 960733, The Model Room"
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
    prompt: "Change `.split(\", \")` to `.split()`, with nothing in the brackets, and run it. How many items now?"
    kind: answer
    accept: ["6", "six"]
    feedback: "Six. With nothing in the brackets, `.split()` cuts at every run of spaces, so the commas stay stuck to the words. Splitting a name into words is useful. Splitting a whole contact like this isn't."
    wrong: "Count the items in the printed list. Commas inside the quotes are part of an item."
  - id: words
    prompt: "Add a line: `print(\"repairs\" in \"Clock Repairs\".lower().split())`. What does it print?"
    kind: answer
    accept: ["True"]
    feedback: "True. `.lower()` gives `clock repairs`, `.split()` gives `['clock', 'repairs']`, and `in` finds `repairs` among the words. Try `\"rep\"` instead: it's in the letters, but it isn't one of the words, so that's False."
  - id: join
    prompt: "Put `.split(\", \")` back. Then add a line that prints the three parts joined back into one, with ` / ` between them: `Riya / 01632 960733 / The Model Room`."
    kind: run
    tests: |
      TESTS = [
          output("Joined with slashes", expect="Riya / 01632 960733 / The Model Room", match="last_line",
                 hint="\" / \".join(parts) glues the list back into one string, with \" / \" between the pieces."),
      ]
    solution: |
      line = "Riya, 01632 960733, The Model Room"
      parts = line.split(", ")
      print(parts)
      print(" / ".join(parts))
---
New contacts will arrive as one typed line. `.split()` cuts text into a list of pieces.

`.join()` goes the other way: `" / ".join(parts)` makes one string, with `" / "` between the pieces. The separator comes first, which looks backwards until you've used it twice.
