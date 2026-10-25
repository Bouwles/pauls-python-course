---
id: make
type: make
title: Counting the forecasts
files: [words.py]
entry: words.py
on_pass: { wendt: "Perplexity 7.34 on forecasts it never saw. As unsure as picking from seven letters, not thirty-nine." }
hints:
  nudge: "Which functions does the program at the bottom call, and in what order? Write them in that order."
  plan:
    - "Make the vocabulary: every character once, in order"
    - Turn the text into ids, and back
    - "Count each pair: this character, then the next"
    - Add to every count, then make each row add up to 1
    - Average minus the log of each real next character's chance
    - "Sample: draw from the row of the character before, again and again"
  shape: |
    def average_nll(probs, ids):
        chances = [probs[a, b] for a, b in zip(___, ___)]
        return float(-np.mean(np.log(chances)))


    def sample(probs, start, length, rng):
        ids = []
        current = start
        for _ in range(length):
            current = int(rng.choice(len(probs), p=probs[___]))
            ids.append(current)
        return ids
---
Write the counting model in `words.py`. The subgoals are Moss's, from the lamp log, plus two more: the score and the sampling.

```
Vocabulary: 39 characters
Perplexity on forecasts it never saw: 7.34
Guessing evenly would be 39
-we rorsmar6zteang. n fas.
soouasorarly mirth ooughterterintmiod.
```

To make up a forecast, start from the newline and draw each next character from the row of the one before: `rng.choice(len(probs), p=probs[current])`, once per character, with the `rng` you're given. The same seed then always gives the same forecast.

It knows only one character back, so it spells like a gull that has heard the radio.
