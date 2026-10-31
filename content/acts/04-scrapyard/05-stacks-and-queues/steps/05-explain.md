---
id: explain-redo
type: explain
title: Two stacks
concept: stacks
dialogue:
  - yahya: "Undo pops onto a second stack, redo pops it back. I left out the clearing. Saves a line."
  - paul: "Run it and read the board."
code: |
  text = ""
  undo_stack = []
  redo_stack = []

  text = text + "Stacks"
  undo_stack.append("Stacks")
  text = text + " at 10"
  undo_stack.append(" at 10")

  undone = undo_stack.pop()
  text = text[:len(text) - len(undone)]
  redo_stack.append(undone)

  text = text + ", queues 2"
  undo_stack.append(", queues 2")

  redone = redo_stack.pop()
  text = text + redone
  undo_stack.append(redone)
  print(text)
prompt: "Run it. Why must a new edit empty the redo stack?"
answer: "The redo stack holds edits undone from the text as it was then. Once there's a new edit, that text is gone, so redoing an old edit tacks ` at 10` onto the end of something it was never part of: Stacks, queues 2 at 10. Clearing the redo stack on every new edit means redo only ever does again what was just undone."
---
An undo button needs one stack: every edit goes on the top, and undo takes back the top one. A redo button needs a second: whatever undo takes off goes on the redo stack, and redo takes it back off and does it again.

Yahya's stacks hold what each edit typed. Follow them down the code before you run it.
