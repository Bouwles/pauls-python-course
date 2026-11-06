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


  def take_job(board):
      biggest = board[0]
      last = board.pop()
      if board:
          board[0] = last
          position = 0
          while True:
              bigger = position
              for child in (2 * position + 1, 2 * position + 2):
                  if child < len(board) and board[child] > board[bigger]:
                      bigger = child
              if bigger == position:
                  break
              board[position], board[bigger] = board[bigger], board[position]
              position = bigger
      return biggest


  board = []
  for hours in [3, 8, 2, 12, 5, 9]:
      add_job(board, hours)
  print(board)
  print(take_job(board), take_job(board), board)
subgoals:
  - label: Put it at the bottom
    lines: [2, 3]
  - label: While it isn't at the top, find its parent
    lines: [4, 5]
  - label: If the parent belongs above it, stop
    lines: [6, 7]
  - label: Otherwise swap them, and climb
    lines: [8, 9]
  - label: Keep the top to hand back
    lines: [13, 13]
  - label: Move the last item up into its place
    lines: [14, 17]
  - label: While a child belongs above it, swap it with the one that belongs highest, and sink
    lines: [18, 26]
explain:
  prompt: "`take_job` pops the last item off before checking whether the board is empty. Why?"
  answer: "If the board held one job, that job is both the top and the last. Popping it leaves an empty board, and there's nothing to move up or sink. Checking `if board:` after the pop stops it writing into position 0 of an empty list."
  concept: heaps
---
Paul's board keeps the biggest job on top, so "belongs above" means bigger: his rule is the other way up from `heapq`'s. `add_job` climbs and `take_job` sinks, as in the last few steps.

The labels beside the code are the steps he took. Your `push` and `pop` take the same steps, smallest on top, and they're in your file as comments.
