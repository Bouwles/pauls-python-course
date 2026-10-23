---
id: worked
type: worked
title: How Moss would find it
dialogue:
  - moss: "Mrs Vance's subject cards. Alphabetical, naturally. She'd have it no other way."
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


  drawer = ["Anchors", "Bees", "Clocks", "Crabs", "Ferries", "Fog", "Gulls",
            "Kelp", "Knots", "Lamps", "Moths", "Rope", "Tides", "Wrecks"]
  print(find_card(drawer, "Rope"))
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
  prompt: "Why does Moss write `low = middle + 1`, and not `low = middle`?"
  answer: "The middle card has just been checked and isn't it, so it can go. Keep it in, and once low and high are side by side, middle never moves: the loop goes round forever."
  concept: binary-search
---
Moss wants Rope. He doesn't start at the front. He looks at the middle card: Gulls comes before Rope, so Rope must be later, and the first seven cards go without a look. Every look halves what's left. That's **binary search**, and it only works because the cards are in order.

`low` and `high` are the first and last cards Rope could still be. When `low` passes `high`, there's nowhere left, so it isn't there.

Strings compare alphabetically: `"Gulls" < "Rope"` is `True`.
