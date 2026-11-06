---
id: predict-vocab
type: predict
title: Every character once
concept: tokenisation
code: |
  text = "sea state"
  vocab = sorted(set(text))
  print(vocab)
  print(len(vocab))
question: What does this print?
options:
  - text: |-
      [' ', 'a', 'e', 's', 't']
      5
    correct: true
    feedback: "Right. `set` keeps each character once, and `sorted` puts them in order: the space sorts before the letters. Five characters, so five ids, 0 to 4."
  - text: |-
      ['s', 'e', 'a', ' ', 't']
      5
    misconception: vocab-first-seen-order
    feedback: "That's the order they first appear in. `sorted` puts them in character order, and a space comes before any letter."
  - text: |-
      ['a', 'e', 's', 't']
      4
    misconception: vocab-skips-space
    feedback: "A space is a character like any other, and the model will need to guess where the spaces go. It gets an id too."
  - text: |-
      [' ', 'a', 'a', 'e', 'e', 's', 's', 't', 't']
      9
    misconception: vocab-counts-repeats
    feedback: "`set` throws away repeats: each character appears once in a vocabulary however often it's used."
after: |
  Run it. Then try `text.split()` instead of `text`: words as the pieces, not characters.
---
A vocabulary from two words of a forecast.
