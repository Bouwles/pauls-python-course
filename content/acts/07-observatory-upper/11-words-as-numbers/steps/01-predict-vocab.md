---
id: predict-vocab
type: predict
title: Every character once
concept: tokenisation
dialogue:
  - neil.neutral.point: "A network only takes numbers. So first, every character gets a number of its own."
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
Cutting text into pieces is **tokenisation**, and the pieces are **tokens**. The list of every different token is the **vocabulary**, and each token's place in it is its id. Encoding turns text into ids; decoding turns them back.

Here the tokens are single characters. A vocabulary of characters is small and can spell any word, even one it has never seen. Words would make shorter sequences but a huge vocabulary, with nothing to say about a word that isn't in it.
