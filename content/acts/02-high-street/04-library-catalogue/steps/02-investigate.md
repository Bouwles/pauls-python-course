---
id: investigate
type: investigate
title: The book as it is
concept: with-statement
dialogue:
  - vance: "The library's copy, typed out. Every word Carroll wrote, and not one of mine."
code: |
  with open("alice.txt") as book:
      text = book.read()

  print(len(text))
  pieces = text.split()
  print(len(pieces))
  print(pieces[88:110])
tasks:
  - id: how-many-pieces
    prompt: "Run it. How many pieces does `text.split()` cut the book into?"
    kind: answer
    accept: ["27028", "27,028"]
    feedback: "27,028. `split()` with nothing in the brackets cuts at every run of spaces and new lines, so each piece is a word with whatever was stuck to it."
    wrong: "It's the second number printed."
  - id: stuck-on
    prompt: "Look at the last line of output. Which piece has a colon stuck to it?"
    kind: answer
    accept: ["do:", "'do:'", "do"]
    feedback: "`do:`. Punctuation stays attached to the word next to it, so `do:` and `do` would be counted as two different words."
    wrong: "Look for a `:` near the end of the list."
  - id: exactly-alice
    prompt: "Add `print(pieces.count(\"Alice\"))`. How many pieces are exactly `Alice`?"
    kind: answer
    accept: ["221"]
    feedback: "221. But `Alice,` and `Alice.` and `\"Alice` aren't exactly `Alice`, so they're missed. She's in the book far more than that."
    wrong: "It's the last number printed."
  - id: every-alice
    prompt: "Count her properly. Go through the pieces; for each one, strip `string.punctuation` off both ends, lower it, and count it if it's `alice`. Print the count. You'll need `import string` at the top."
    kind: run
    tests: |
      TESTS = [
          output("Every Alice", expect="386", match="last_line",
                 hint="For each piece: word = piece.strip(string.punctuation).lower(), then add one if word == \"alice\". Print the total last."),
      ]
    solution: |
      import string

      with open("alice.txt") as book:
          text = book.read()

      print(len(text))
      pieces = text.split()
      print(len(pieces))
      print(pieces[88:110])
      print(pieces.count("Alice"))
      total = 0
      for piece in pieces:
          if piece.strip(string.punctuation).lower() == "alice":
              total += 1
      print(total)
---
`open()` opens a file. `with ... as book:` keeps it open for the indented block and closes it when the block ends, even if something inside goes wrong. `.read()` gives back the whole file as one string.

`alice.txt` is *Alice's Adventures in Wonderland*, the copy the reading group is using. `string.punctuation` is every punctuation mark on the keyboard, and `.strip(string.punctuation)` takes any of them off the ends of a word.
