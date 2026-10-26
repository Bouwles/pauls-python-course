---
id: make
type: make
title: Make the magazine's numbers
timeout_ms: 20000
on_pass: { priya: "Nought point three on the middle day. That's the number people will recognise." }
hints:
  nudge: "What does `values.mode()` give you back, and how do you get one number out of it? And which two conditions make a reading an outlier?"
  plan:
    - Work out each number with a pandas method, and put them in a dictionary
    - Find the quartiles
    - Measure the middle half
    - Set the fences, one and a half middles out
    - Keep what falls outside
    - Count the days below the threshold
  shape: |
    def summary(values):
        return {
            "mean": values.mean(),
            "median": ___,
            "mode": values.mode().___,
            "std": ___,
            "q1": values.quantile(___),
            "q3": ___,
        }


    def outliers(values):
        low, high = fences(values)
        return values[(values < low) ___ (values > high)]


    def dry_days(rain, threshold=0.2):
        return int((rain ___ threshold).sum())
---
Write the four functions. The report at the bottom is done.

```
Rain on an average day: 2.6 mm. On the middle day: 0.3 mm.
Most common: 0.0 mm. Dry days: 160 of 366
{{town}}: average 12.7 degrees C, standard deviation 4.3
Thornby: average 12.7 degrees C, standard deviation 6.3
Outside the fences:
  {{town}}, 2024-06-14: 41.3 degrees C
  Thornby: 0 readings
  Rain: 38 days
```

The fence rule flags one temperature and thirty-eight days of rain. The temperature is a fault. The rain days are real: in a distribution with a long tail, a rule built for tidy, even readings calls the tail odd. An outlier is a question, not a verdict.

The checks try small Series of their own too, including a tie for the most common value.
