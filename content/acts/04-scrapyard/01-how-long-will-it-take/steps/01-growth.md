---
id: growth
type: concept
title: Steps, not seconds
concept: big-o
widget: growth
params: { max: 1000, show: ["1", "logn", "n", "nlogn", "n2"] }
dialogue:
  - yahya: "Paul's script is instant on two hundred parts. That proves nothing."
  - paul: "Agreed. A program works in steps. Count those, and watch how they grow."
---
Every program takes some number of steps to get through a pile of n parts. For the clockmaker's lot, the number today matters less than how it grows.

Each line is one kind of program:

- **O(1)**: the same steps whatever the size, like picking the top part off a pile.
- **O(log n)**: halves what's left with every step.
- **O(n)**: looks at each part once.
- **O(n log n)**: a log n job for each part. Good sorting is like this.
- **O(n²)**: compares every part with every other part.

That way of writing it is called **Big-O**. Drag n along and watch which line leaves the others behind.
