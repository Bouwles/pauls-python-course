---
id: worked
type: worked
title: How Paul would find it
dialogue:
  - paul.pleased.point: "The Workshop's index cards. Alphabetical, naturally. I'd have it no other way."
code: |
  def find_card(drawer, subject):
      low = 0
      high = len(drawer) - 1
      while low <= high:
          middle = (low + high) // 2
          print(f"Card {middle}: {drawer[middle]}")
          if drawer[middle] == subject:
              return middle
          elif drawer[middle] < subject:
              low = middle + 1
          else:
              high = middle - 1
      return -1


  drawer = ["Arrays", "Bits", "Classes", "Closures", "Dicts", "Files", "Generators",
            "Hashing", "Imports", "Lambdas", "Modules", "Recursion", "Sets", "Tuples"]
  print(find_card(drawer, "Recursion"))
subgoals:
  - label: Mark the first and last place it could be
    lines: [2, 3]
  - label: While there's anywhere left to look
    lines: [4, 4]
  - label: Look in the middle
    lines: [5, 6]
  - label: "Found it: say where"
    lines: [7, 8]
  - label: "Too early: throw away the middle and everything before it"
    lines: [9, 10]
  - label: "Too late: throw away the middle and everything after it"
    lines: [11, 12]
  - label: "Nowhere left: say so"
    lines: [13, 13]
explain:
  prompt: "Why does Paul write `low = middle + 1`, and not `low = middle`?"
  answer: "The middle card has just been checked and isn't it, so it can go. Keep it in, and once low and high are side by side, middle never moves: the loop goes round forever."
  concept: binary-search
---
Paul keeps the Workshop's index cards in alphabetical order, so he can use a binary search. He wants Recursion. Each look prints the card: Generators, Modules, Sets, then Recursion, four looks out of fourteen cards.

The labels beside the code are the steps he took. Your `find_part` takes the same steps, and they're in your file as comments. Yours also counts its looks, as the bolt drawers did.
