---
id: pips
type: pips
title: Pip's Version
dialogue:
  - pip: "Undo for Nell's tally. Every change goes in the history, and undo takes one back."
  - pip: "She typed forty hubcaps instead of four. Pressed undo. She's still got forty hubcaps."
dialogue_after:
  - pip: "History's a stack. Last in, first out. I did know that. I just didn't type it."
hints:
  nudge: "Nell's mistake was the latest change. Which end of `history` is the latest change at, and which end does Pip take from?"
  plan:
    - Find where undo takes a change out of the history
    - Take the latest change, from the top of the stack
    - Check that undoing twice takes back the last two changes, newest first
  shape: |
    def undo(self):
        if not self.history:
            return
        part, count = self.history.___()
        self.counts[part] = self.counts[part] - count
---
An undo button is a stack. Every change goes on the top, and undo takes back the change on top, which is the latest. Undo again, and it takes back the one before.

Pip's tally keeps every change in `history`. Run it: Nell meant 4 hubcaps, typed 40, and pressed undo. Then fix it.
