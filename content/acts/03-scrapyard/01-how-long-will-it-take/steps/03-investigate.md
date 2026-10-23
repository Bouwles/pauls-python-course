---
id: investigate
type: investigate
title: Three ways through a pile
concept: big-o
code: |
  def look_at_each(n):
      steps = 0
      for part in range(n):
          steps = steps + 1
      return steps


  def compare_every_pair(n):
      steps = 0
      for first in range(n):
          for second in range(first + 1, n):
              steps = steps + 1
      return steps


  def keep_halving(n):
      steps = 0
      pile = n
      while pile > 1:
          pile = pile // 2
          steps = steps + 1
      return steps


  for n in [1000, 2000]:
      print(n, look_at_each(n), compare_every_pair(n), keep_halving(n))
tasks:
  - id: pairs-double
    prompt: "Run it. When n doubles, how many times more steps does `compare_every_pair` take?"
    kind: answer
    accept: ["4", "four", "x4", "4x", "4 times", "four times", "about 4", "roughly 4", "nearly 4", "just over 4", "quadruples", "it quadruples"]
    feedback: "About four. Twice the parts, and each one has twice as many others to be compared with. When doubling n quadruples the steps, it's O(n²)."
    wrong: "Divide the third number on the second row by the third number on the first."
  - id: halving-double
    prompt: "And `keep_halving`? What happens to its steps when n doubles?"
    kind: answer
    accept: ["1", "one", "+1", "one more", "1 more", "goes up by one", "goes up by 1", "up by one", "up by 1", "it goes up by one", "it goes up by 1", "adds one", "adds 1", "plus one", "plus 1", "increases by one", "increases by 1", "one more step"]
    feedback: "One more step. Doubling the pile adds only one halving. That's O(log n): it barely notices the pier."
    wrong: "Compare the last number on each row."
  - id: million
    prompt: "Without running it: how many steps would `keep_halving(1_000_000)` take? Then check."
    kind: answer
    accept: ["19", "nineteen"]
    feedback: "Nineteen. A million parts, nineteen halvings. Keep that number in mind for the next job."
    wrong: "A thousand took 9. Each doubling adds one, and it takes about ten doublings to get from a thousand to a million."
  - id: twice
    prompt: "Add a second `for` loop to `look_at_each`, after the first one and not inside it, so it counts each part twice. Run it."
    kind: run
    tests: |
      TESTS = [
          output("Two loops, one after the other", expect="1000 2000 499500 9\n2000 4000 1999000 10",
                 hint="The second for loop goes after the first, at the same indent, before the return."),
      ]
    solution: |
      def look_at_each(n):
          steps = 0
          for part in range(n):
              steps = steps + 1
          for part in range(n):
              steps = steps + 1
          return steps


      def compare_every_pair(n):
          steps = 0
          for first in range(n):
              for second in range(first + 1, n):
                  steps = steps + 1
          return steps


      def keep_halving(n):
          steps = 0
          pile = n
          while pile > 1:
              pile = pile // 2
              steps = steps + 1
          return steps


      for n in [1000, 2000]:
          print(n, look_at_each(n), compare_every_pair(n), keep_halving(n))
  - id: still-linear
    prompt: "Does doubling n still double what `look_at_each` counts?"
    kind: answer
    accept: ["yes", "y", "yes it does", "it does", "yes, it does", "yes, it doubles", "yes it doubles", "it still doubles", "still doubles", "doubles", "yes, still doubles"]
    feedback: "Yes: 2000, then 4000. Two loops one after the other make 2n steps, and 2n still grows like n. Big-O drops the 2 and calls it O(n). It describes how the count grows, not how big it is."
    wrong: "Look at the second number on each row."
---
Three ways of working through a pile of n parts. Each function counts its steps and gives back the count. `//` divides and throws away the remainder: `7 // 2` is 3.

The program prints n, then the steps each function took.
