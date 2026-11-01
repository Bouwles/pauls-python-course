---
id: investigate
type: investigate
title: A name that isn't there
concept: dict-get
code: |
  book = {"Paul": "The Workshop", "Neil": "The Puzzle Room"}
  print(book["Neil"])
tasks:
  - id: run-it
    prompt: "Run it. What does it print?"
    kind: answer
    accept: ["The Puzzle Room"]
    feedback: "The Puzzle Room. The key goes in the square brackets; the value comes out."
  - id: missing
    prompt: "Change the key to `\"Yahya\"` and run it. What kind of error is it?"
    kind: answer
    accept: ["KeyError", "key error", "KeyError: 'Yahya'"]
    feedback: "A KeyError. The key isn't in the dictionary, and Python won't hand you a blank instead."
    wrong: "Read the last line of the traceback. The first word is the kind of error."
  - id: get
    prompt: "Now try `print(book.get(\"Yahya\"))`. What does it print?"
    kind: answer
    accept: ["None"]
    feedback: "`None`. `.get()` asks politely: a missing key gives `None` instead of a crash."
  - id: in
    prompt: "What does `print(\"Neil\" in book)` print?"
    kind: answer
    accept: ["True"]
    feedback: "True. `in` checks the keys, the way it checked a list."
  - id: default
    prompt: "Make the last print show `No address` for Yahya, using `.get()` with a second value."
    kind: run
    tests: |
      TESTS = [
          output("No address for Yahya", expect=r"^No address$", match="regex",
                 hint="book.get(key, something) gives something when the key is missing."),
      ]
    solution: |
      book = {"Paul": "The Workshop", "Neil": "The Puzzle Room"}
      print(book.get("Yahya", "No address"))
---
Riya's book will be asked for names that aren't in it yet. Find out what happens.
