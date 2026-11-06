---
id: learn-precedence
type: learn
title: Which sum comes first
concept: operator-precedence
code: |
  print(2 + 3 * 4)
  print((2 + 3) * 4)
---
When a sum has more than one sign in it, Python doesn't simply work from left to right. It uses the order from maths lessons:

1. brackets first
2. then `*` and `/`
3. then `+` and `-`

So `2 + 3 * 4` is `14`: the `3 * 4` happens first, then the 2 is added. Put brackets round the part you want done first, and `(2 + 3) * 4` is `20`. Signs of the same rank, like `+` and `-`, go left to right.

The usual mistake is reading a sum left to right, like a sentence. When you're not sure which part comes first, add brackets. They cost nothing, and the next person to read your code won't have to work it out either.
