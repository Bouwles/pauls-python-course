---
id: explain-redo
type: explain
title: Two stacks
concept: stacks
dialogue:
  - yahya.proud: "Undo pops onto a second stack, redo pops it back. I left out the clearing. Saves a line."
  - paul.unimpressed: "Run it and read the board."
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
Yahya's undo and redo, on text this time. His stacks hold what each edit typed, and he left out emptying the redo stack. Follow them down the code before you run it.
