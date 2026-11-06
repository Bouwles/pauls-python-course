---
id: learn-variables
type: learn
title: Names for values
concept: variables
code: |
  chips = 4
  print(chips)
  chips = chips * 2
  print(chips)
---
A **variable** is a name for a value. A value is any piece of data, like a number or a string. `chips = 4` makes the name `chips` stand for 4: think of a label stuck on a box with 4 in it.

After that, `chips` without quotes means "whatever `chips` holds". So `print(chips)` prints `4`, not the word.

The `=` sign doesn't mean "equals" as it does in maths. It means: work out the right side, then put the name on the answer. So `chips = chips * 2` works out `4 * 2`, using the value `chips` has now, then moves the label to 8.

The usual mistake is reading that line as an equation that can't be true.
