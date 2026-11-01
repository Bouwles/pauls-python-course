---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya.pleased.wave: "Can you look at mine? A tally of my paints, with undo. I tried undo once, on one change. Perfect."
  - riya.worried: "Then I typed forty tubes of yellow instead of four and pressed undo. Still forty."
dialogue_after:
  - riya.thinking: "History's a stack. Last in, first out. One change was never going to show me that."
hints:
  nudge: "The mistake was the latest change. Which end of `history` is the latest change at, and which end does Riya take from?"
  plan:
    - Find where undo takes a change out of the history
    - Take the latest change, from the top of the stack
    - Check that undoing twice takes back the last two changes, newest first
  shape: |
    def undo(self):
        if not self.history:
            return
        paint, count = self.history.___()
        self.counts[paint] = self.counts[paint] - count
---
An undo button is a stack. Every change goes on the top, and undo takes back the change on top, which is the latest. Undo again, and it takes back the one before.

Riya's tally of paint tubes for the Makerspace keeps every change in `history`. Run it: she meant 4 tubes of cadmium yellow, typed 40, and pressed undo. Then fix it.
