---
id: predict-write
type: predict
title: Writing it down
concept: files
code: |
  with open("shelf.txt", "w") as shelf:
      shelf.write("Emma")
      shelf.write("Moby-Dick")

  with open("shelf.txt") as shelf:
      print(shelf.read())
question: What does this print?
options:
  - text: "EmmaMoby-Dick"
    correct: true
    feedback: "Right. `.write()` writes exactly what you give it and nothing more. No space, no new line."
  - text: |-
      Emma
      Moby-Dick
    misconception: write-adds-newline
    feedback: "That's what two `print`s would do. `.write()` adds no new line; you have to write `\"\\n\"` yourself."
  - text: "Moby-Dick"
    misconception: write-replaces-each-time
    feedback: "Inside one `with` block, each `.write()` carries on from where the last one stopped. Nothing is replaced."
after: |
  Run it. Then put `"\n"` on the end of each title and run it again.
---
`open("shelf.txt", "w")` opens a file for writing, and makes it if it isn't there. `.write()` puts text in it. Opening without the `"w"` reads instead, and `.read()` gives back everything in the file as one string.

What ends up on Mrs Vance's shelf?
