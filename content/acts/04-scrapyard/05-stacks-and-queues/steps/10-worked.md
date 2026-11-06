---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "Marks on the chalkboard, with undo and redo. Same shape as your editor, with numbers."
code: |
  from collections import deque


  class Tally:
      """A running total of marks, with undo and redo."""

      def __init__(self):
          self.total = 0
          self.undo_stack = []
          self.redo_stack = []

      def add(self, marks):
          if marks == 0:
              return
          self.total = self.total + marks
          self.undo_stack.append(marks)
          self.redo_stack.clear()

      def undo(self):
          if not self.undo_stack:
              return False
          marks = self.undo_stack.pop()
          self.total = self.total - marks
          self.redo_stack.append(marks)
          return True

      def redo(self):
          if not self.redo_stack:
              return False
          marks = self.redo_stack.pop()
          self.total = self.total + marks
          self.undo_stack.append(marks)
          return True


  def run(tally, line):
      printed = []
      waiting = deque(command.strip() for command in line.split(";"))
      while waiting:
          command = waiting.popleft()
          if command == "undo" and not tally.undo():
              printed.append("Nothing to undo.")
          elif command == "redo" and not tally.redo():
              printed.append("Nothing to redo.")
          elif command.isdigit():
              tally.add(int(command))
      return printed


  board = Tally()
  print(run(board, "12; 7; undo; 5; redo"), board.total)
subgoals:
  - label: "A change: nothing to change, no edit"
    lines: [13, 14]
  - label: Make the change, push it, clear redo
    lines: [15, 17]
  - label: "Undo: nothing on the stack? False"
    lines: [20, 21]
  - label: Pop the latest, take it back, push it onto redo
    lines: [22, 25]
  - label: "Redo: the same, the other way round"
    lines: [27, 33]
  - label: Split the line on ;, and queue the commands
    lines: [37, 38]
  - label: Take each from the front, in turn
    lines: [39, 46]
explain:
  prompt: "The last line prints `['Nothing to redo.'] 17`. Why is there nothing to redo, when the 7 was undone?"
  answer: "Adding the 5 was a new change, and a new change empties the redo stack. The undone 7 belonged to the board before the 5 went on."
  concept: stacks
---
Paul's tally keeps a running total of marks on the chalkboard. Each change is pushed onto the undo stack, undo and redo move changes between the two stacks, and `run` queues a line of commands in a `deque` and takes them from the front, in the order they were typed.

The labels beside the code are the steps he took. Your editor takes the same steps, with text instead of numbers, and they are in your file as comments.
