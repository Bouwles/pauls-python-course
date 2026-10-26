---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "The pier board. Three days of weather, and I've got nine lines of it. Extra value."
  - pip: "Priya says Sunday can't be three temperatures at once. She hasn't seen Sunday."
dialogue_after:
  - pip: "zip walks them side by side. Like the tailor's lists. I knew that, I was testing you."
hints:
  nudge: "Count the lines. For each day, how many highs does the inner loop go through?"
  plan:
    - Run it and count the lines
    - Replace the two loops with one loop over both lists
    - Unpack the date and its high from each pair
  shape: |
    for day, high in ___(daily["time"], daily["temperature_2m_max"]):
        print(f"{day}: up to {round(high)}°C")
---
Pip's board should print one line a day: the date and that day's highest temperature. Run it.

```
2026-10-25: up to 13°C
2026-10-26: up to 16°C
2026-10-27: up to 16°C
```

Fix it so it does. The checks try it on another forecast too, with four days in it.
