---
id: predict-unwind
type: predict
title: Up and down again
concept: call-stack
dialogue:
  - nell: "Up the ladder to the top crate, then back down. Every rung twice."
code: |
  def climb(rung):
      if rung == 0:
          print("top")
          return
      print("up", rung)
      climb(rung - 1)
      print("down", rung)


  climb(2)
question: What does this print?
options:
  - text: |-
      up 2
      up 1
      top
      down 1
      down 2
    correct: true
    feedback: "Right. Each call stops at `climb(rung - 1)` and waits. When the call above it returns, it carries on from that line. The newest call finishes first, so the way down is the way up, backwards."
  - text: |-
      up 2
      up 1
      top
    misconception: code-after-call-skipped
    feedback: "A call to `climb` isn't a jump that leaves the old call behind. The old call waits, and when the new one returns it carries on and prints its down line."
  - text: |-
      up 2
      up 1
      top
      down 2
      down 1
    misconception: unwinds-in-call-order
    feedback: "The waiting calls finish newest first. `climb(1)` is on top of `climb(2)`, so it prints down 1 before `climb(2)` gets its turn."
  - text: |-
      up 2
      down 2
      up 1
      down 1
      top
    misconception: call-waits-its-turn
    feedback: "The call happens on its own line, straight away, not after the current call finishes. `climb(2)` stops at line 6 and waits while `climb(1)` runs."
after: |
  Run it, then press Step through and watch the tower grow by one crate per rung and shrink again.
---
When a function calls another, the first one stops on that line and waits. When the call it made returns, it carries on from where it stopped, with its own variables just as it left them.
