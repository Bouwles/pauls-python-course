---
id: round-and-round
type: learn
title: Sixty times a second
dialogue:
  - paul.thinking.point: "A game is a loop that never stops asking what happened, and drawing the answer."
concept: game-loop
code: |
  class Drop:
      """One mackerel falling down a column five rows high. Rules only: nothing is printed here."""

      def __init__(self):
          self.row = 0
          self.landed = False

      def update(self):
          """One frame of the rules."""
          if not self.landed:
              self.row += 1
              self.landed = self.row == 4

      def state(self):
          """Everything there is to draw."""
          return {"row": self.row, "landed": self.landed}


  game = Drop()
  for frame in range(5):
      game.update()                      # the rules move on one frame
      print(frame, game.state())         # the drawing reads the state, and changes nothing
---
Every game is the same loop: read the input, update the rules by one step, draw, wait. Round it goes, sixty times a second. Each pass is a **frame**, and speeds are counted per frame: four pixels a frame is 240 pixels a second.

Keep a line between the rules and the drawing. `update()` belongs to the rules: where everything is, and what happens when things meet, but nothing about screens, keys or colours. The drawing reads `state()`, paints it, and changes nothing.

Then the rules can be tested without a window, ten thousand frames in a blink. The example is a game with the drawing replaced by `print`: the mackerel lands on frame 3, and frame 4 changes nothing.

The usual mistake is drawing inside `update()`. Then every test needs a screen.
