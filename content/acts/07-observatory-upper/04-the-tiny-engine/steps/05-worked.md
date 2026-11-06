---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.unimpressed: "The little door to the clock's gears sticks. Six jobs, and some can't start until others are done."
code: |
  # Mending the clock-room door: each job, and the jobs it needs done first.
  needs = {
      "rehang": ["varnish"],
      "varnish": ["sand", "glue"],
      "sand": ["plane"],
      "glue": ["plane", "cut dowels"],
      "plane": [],
      "cut dowels": [],
  }

  order = []
  done = set()


  def visit(job):
      if job in done:
          return
      done.add(job)
      for first in needs[job]:
          visit(first)
      order.append(job)


  visit("rehang")
  print("Do them in this order:", order)
  print("Check them in this order:", list(reversed(order)))
subgoals:
  - label: Each job, and the jobs it needs first
    lines: [1, 9]
  - label: Start with an empty order
    lines: [11, 12]
  - label: Visit each job once
    lines: [15, 18]
  - label: Visit what it needs first
    lines: [19, 20]
  - label: Then it goes on the list
    lines: [21, 21]
  - label: Walk the list backwards
    lines: [24, 26]
explain:
  prompt: "`plane` is needed by both `sand` and `glue`. What would go wrong without the `done` set?"
  answer: "`plane` would go on the list twice, once for each job that needs it. In the engine, a value on the list twice would pass its blame back twice, and every gradient behind it would come out double."
  concept: autograd
---
The same ordering, on a real job list: mending the door to the clock's gears. Each job needs some others done first, as a value needs its parents. `visit` finishes what a job needs before writing the job down, and `done` keeps each job on the list once.

Press Step through and watch the stack of calls: each block is a job waiting for the jobs it needs. The labels beside the code are Paul's steps, and your engine's `backward` uses them.
