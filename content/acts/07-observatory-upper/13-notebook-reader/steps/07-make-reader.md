---
id: make-reader
type: make
title: The notebook reader
files: [notes.py, baseline.py, model.py, reader.py]
entry: reader.py
starter_from: make-model
on_pass: { aaesha.laughing: "It finished a note about the duck in two words. It has learnt that the duck never says anything." }
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

Temperature works as in the Tiny GPT. Here the model gives chances, not scores, so raise every chance to the power `1 / temperature` and divide by the new total, which does the same: below 1 the likely characters get likelier, above 1 the chances flatten out. At 0, take the likeliest, `np.argmax`. Draw with `rng.choice(len(chances), p=...)`, once per character.

```
Reading with Aaesha's weights.
Good names one a you came test poen thing, the code that are in the code. P.
The duck. P.
Whoever reads this nrom the son. P.
Always the likeliest: The clock and the code it has not a the code it has not a the code it
```

The program makes one `rng = np.random.default_rng(20)` and finishes `Good names`, `The duck` and `Whoever reads this` at a temperature of 0.7, then the likeliest note from `The clock`, with a limit of 60. Use `my_weights.json` if it exists, and `trained.json` if it doesn't. Files your programs write stay with the Job, so once you've run `model.py` the reader reads with your weights.
