---
id: reading
type: reading
title: What it can't know
dialogue:
  - neil.worried: "The stargazing nights are booked solid. Some people never come, and someone on the waiting list misses out."
  - neil.thinking: "A model could give away the slots it thinks will be empty. If I can trust it."
---
Neil has two seasons of bookings, and this season's locked in the bottom drawer of his desk, under the duck.

Before you build anything, three questions an honest audit asks:

1. **When is each column known?** A forecast is made when someone books. Anything written down on the night itself can't be in it, however well it scores.
2. **Did any preprocessing see the answers?** Scaling, choosing columns, filling gaps: all of it goes inside the pipeline, so each fold is measured without itself.
3. **Who is it wrong about?** One accuracy for everyone can hide a group the model barely saw. Score each group, and look hardest at the mistake that costs them.

A model only knows its columns. If something that matters isn't in them, like how far someone travels to get here, the model can't know it, and its mistakes will fall on whoever depends on it.
