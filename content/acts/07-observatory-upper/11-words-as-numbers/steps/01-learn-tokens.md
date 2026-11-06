---
id: learn-tokens
type: learn
title: Text into numbers
concept: tokenisation
dialogue:
  - neil.neutral.point: "A network only takes numbers. So first, every character gets a number of its own."
code: |
  text = "gale 8"
  vocab = sorted(set(text))                            # every character once, in order
  index = {char: i for i, char in enumerate(vocab)}    # character to id
  ids = [index[char] for char in text]                 # encode
  print(vocab)
  print(ids)
  print("".join(vocab[i] for i in ids))                # decode
---
Cutting text into pieces is **tokenisation**, and the pieces are **tokens**. Here each token is one character. The list of every different token, once each, is the **vocabulary**, and a token's place in that list, counting from 0, is its **id**.

`sorted(set(text))` makes the vocabulary: `set` keeps each character once, and `sorted` puts them in order, with the space first. A dictionary from character to id, made with `enumerate`, **encodes** text as ids. Looking each id up in the list **decodes** it back.

Characters make a small vocabulary that can spell any word, even a new one. Words make shorter sequences, but a huge vocabulary, and nothing to say about a word it has never seen.

The usual mistake is forgetting the space. It's a character too.
