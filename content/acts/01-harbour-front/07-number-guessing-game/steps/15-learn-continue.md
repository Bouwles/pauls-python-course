---
id: learn-continue
type: learn
title: Skip this one
concept: break-continue
code: |
  for seat in range(1, 6):
      if seat == 3:
          continue
      print("Tea for seat", seat)
  print("Round done.")
---
`continue` skips the rest of this pass and goes straight back to the top of the loop for the next one.

It's for the ones that don't count. Caitlin's game will use it for a guess outside 1 to 100: say so, then skip the counting.

Seat 3 has brought their own tea. When `seat` is 3, `continue` skips the `print`, and the loop moves on to seat 4. The example prints tea for seats 1, 2, 4 and 5, then `Round done.`

The usual slip comes from English, where continue means carry on. In Python it means skip ahead. And it's not `break`: the loop keeps going.
