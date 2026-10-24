---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "The dome shutter. Six jobs, and some can't start until others are done."
  - moss: "Same problem as her cards. Each one needs its parents done first."
code: |
  # The dome shutter repair: each job, and the jobs it needs done first.
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
A list with every job after the jobs it needs is in **topological order**. `visit` gets it by finishing everything a job needs before writing the job down.

For the engine, a value's parents are what it needs. Walk that list backwards and you start at the answer, and no value passes its blame back until every value made from it has handed its share over.

Press Step through and watch Nell's junk tower: each crate is a job waiting for the jobs it needs.
