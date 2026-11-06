---
id: make
type: make
title: Make the station's answer
timeout_ms: 30000
on_pass: { yahya.proud.thumbs: "Warmer, and not by luck. Drier, perhaps: luck does that one time in ten. I'll tell Paul exactly that." }
hints:
  nudge: "If the label didn't matter, any of the readings could have been 'after'. How do you deal the pooled readings out again at random, and which part of the dealt array is 'before'?"
  plan:
    - Measure the real difference
    - Pool the readings, as if the label didn't matter
    - Shuffle and deal them out again, many times
    - Count how often chance does as well
    - The share is the p-value
    - For correlation, take each mean off, then put the three sums together
  shape: |
    def shuffled_differences(before, after, rng, shuffles=10_000):
        pooled = np.concatenate([___, ___])
        size = len(before)
        results = np.empty(shuffles)
        for i in range(shuffles):
            dealt = rng.___(pooled)
            results[i] = difference(dealt[:___], dealt[___:])
        return results


    def p_value(before, after, rng, shuffles=10_000):
        real = difference(before, after)
        return np.mean(shuffled_differences(before, after, rng, shuffles) ___ real)


    def correlation(x, y):
        x_from_mean = np.asarray(x, dtype=float) - np.mean(x)
        y_from_mean = ___
        return np.sum(___) / np.sqrt(np.sum(x_from_mean ** 2) * ___)
---
Write the four functions. The report at the bottom is done.

```
First thirty years: 11.06 degrees C. Last thirty: 11.92.
Warmer by 0.86 degrees C. Shuffled 10,000 times, chance did as well 0 times.
Drier by 35 mm a year. Shuffled 10,000 times, chance did as well 1,090 times.
Year and temperature: r = 0.63
The Clocktower's age and temperature: r = 0.63
```

Shuffle with the `rng` you're given, so the same seed always gives the same answer. Your counts may differ a little from these, depending on how you deal.

Write `correlation` from the formula in "Rising and falling together". The checks won't accept `np.corrcoef` here, but you can use it to check your own answers.
