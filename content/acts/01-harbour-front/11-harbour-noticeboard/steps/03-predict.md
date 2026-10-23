---
id: predict-split
type: predict
title: Words, then text again
concept: split-join
code: |
  notice = "Lost   one    oar"
  words = notice.split()
  print(" ".join(words))
question: What does this print?
options:
  - text: "Lost one oar"
    correct: true
    feedback: "Right. `.split()` throws away every run of spaces, and `.join()` puts exactly one back between each word."
  - text: "Lost   one    oar"
    misconception: split-keeps-gaps
    feedback: "`.split()` with nothing in the brackets treats any run of spaces as one gap. The extra spaces don't survive."
  - text: "['Lost', 'one', 'oar']"
    misconception: join-gives-list
    feedback: "That's what `words` holds. `.join()` turns the list back into one string."
after: |
  Run it. Then try `print("-".join(words))`.
---
`.split()` cuts text into a list of words. `" ".join(words)` glues a list of strings into one, with `" "` between each.

Penhallow's old keyboard sticks, so half the notices have spaces everywhere.
