---
id: learn-undo
type: learn
title: Undo and redo
concept: stacks
code: |
  board = 0
  undo_stack = []
  redo_stack = []

  for marks in [12, 7, 5]:
      board = board + marks
      undo_stack.append(marks)
  print("Board:", board)

  marks = undo_stack.pop()
  board = board - marks
  redo_stack.append(marks)
  print("Undo:", board)

  marks = redo_stack.pop()
  board = board + marks
  undo_stack.append(marks)
  print("Redo:", board)
---
An undo button is a stack. Every change is pushed onto the **undo stack**. Undo pops the latest change and does the opposite.

Redo needs a second stack. Whatever undo pops goes onto the **redo stack**, and redo pops it back off, does it again, and pushes it back onto the undo stack.

The example adds 12, 7 and 5 marks to a board, undoes the 5 and redoes it. It prints `Board: 24`, `Undo: 19`, `Redo: 24`.

One rule keeps them honest: a new change empties the redo stack. What was undone belonged to the board as it was then, and that board has gone. The usual slip is to forget it.
