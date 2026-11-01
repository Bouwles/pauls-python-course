---
id: worked
type: worked
title: How Paul keeps his jobs board
dialogue:
  - paul.laughing: "My jobs board. Biggest job on top, so I can see what I'm avoiding."
code: |
  def add_job(board, hours):
      board.append(hours)
      position = len(board) - 1
      while position > 0:
          parent = (position - 1) // 2
          if board[parent] >= board[position]:
              break
          board[position], board[parent] = board[parent], board[position]
          position = parent


  board = []
  for hours in [3, 8, 2, 12, 5, 9]:
      add_job(board, hours)
      print(board)
subgoals:
  - label: Put it at the bottom
    lines: [2, 3]
  - label: While it isn't at the top
    lines: [4, 4]
  - label: Find its parent
    lines: [5, 5]
  - label: If the parent is no smaller, stop
    lines: [6, 7]
  - label: Otherwise swap them, and climb
    lines: [8, 9]
explain:
  prompt: "Paul's board will never hold more than a few hundred jobs. Why does adding one take O(log n) steps, not O(n)?"
  answer: "The new job only climbs, one level per swap, and never looks sideways. Each level holds twice as many jobs as the one above, so a board of a thousand jobs is only about ten levels deep."
  concept: heaps
---
A heap is a tree kept in a list. The item at position 0 is the top. Each item has up to two children below it, at `2 * position + 1` and `2 * position + 2`, and its parent is at `(position - 1) // 2`.

The one rule: no child is bigger than its parent. Paul's board keeps the biggest job on top, so his rule is the other way up from `heapq`'s.

To add a job, put it at the bottom and let it climb: swap it with its parent while it's bigger.

Press Step through and watch the bars: the 12 goes in at the end and climbs to the front in two swaps.
