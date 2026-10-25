---
id: make-reader
type: make
title: The notebook reader
files: [notes.py, baseline.py, model.py, reader.py]
entry: reader.py
starter_from: make-model
on_pass: { wendt: "\"The machine on the hill does. A.P.\" Does what, it doesn't say. Neither did she, half the time." }
hints:
  nudge: "What does the window hold before the model has guessed anything? And after each guess, what goes on the end of it?"
  plan:
    - The window starts as newlines, then the start of the note
    - The chances of every next character, from the last CONTEXT characters
    - "Choose one: the likeliest, or a draw from the chances sharpened or flattened by temperature"
    - A newline ends the note
    - Add the character to the window and to the text, and go round again
  shape: |
    def complete(start, params, vocab, rng, temperature=1.0, limit=200):
        index = {char: i for i, char in enumerate(vocab)}
        ids = [index[NEWLINE]] * CONTEXT + [index[char] for char in start]
        text = start
        for _ in range(limit):
            P, _ = forward(np.array([ids[___:]]), params)
            chances = P[0]
            if temperature == 0:
                choice = int(np.argmax(chances))
            else:
                weighted = chances ** (1 / ___)
                choice = int(rng.choice(len(chances), p=___))
            if vocab[choice] == NEWLINE:
                break
            ...
        return text
---
Write `complete` in `reader.py`, and a program that finishes three notes.

**Temperature** changes how bold the choices are. Raise every chance to the power `1 / temperature` and divide by the new total: below 1 the likely characters get likelier, above 1 the chances flatten out. At 0, take the likeliest, `np.argmax`. Draw with `rng.choice(len(chances), p=...)`, once per character.

```
Reading with Wendt's weights.
The machine on the hill does. A.P.
Tom says it works the kead the hill say. A.P.
Whoever reads this mowhing a fon the late itce tell'bd them. A.P.
Always the likeliest: The gate. I learned the hill dine on the hill dine on the hill dine
```

Use `my_weights.json` if it exists, and `trained.json` if it doesn't. Files your programs write stay with the Job, so once you've run `model.py` the reader reads with your weights.
