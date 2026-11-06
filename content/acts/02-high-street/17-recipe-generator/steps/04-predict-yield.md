---
id: predict-yield
type: predict
title: Paused at the yield
concept: generators
code: |
  def bake():
      print("mixing")
      yield "first tray"
      print("mixing again")
      yield "second tray"


  oven = bake()
  print("oven on")
  print(next(oven))
question: What does this print?
options:
  - text: |-
      oven on
      mixing
      first tray
    correct: true
    feedback: "Calling `bake()` runs none of it. `next` runs the body as far as the first `yield`, hands over `first tray`, and pauses there."
  - text: |-
      mixing
      oven on
      first tray
    misconception: generator-runs-on-call
    feedback: "Calling a generator function doesn't run its body. It hands back a paused generator, and the body only starts when `next` asks."
  - text: |-
      oven on
      mixing
      first tray
      mixing again
      second tray
    misconception: next-runs-whole-generator
    feedback: "`next` runs only as far as the next `yield`, then stops. `mixing again` waits until something asks a second time."
after: |
  Add a second `print(next(oven))`, run it, and watch where it picks up.
---
A generator for the bake sale's oven, asked once.
