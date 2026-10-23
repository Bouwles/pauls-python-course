---
id: explain
type: explain
title: Kat's way
dialogue:
  - kat: "A shed is not a list. A shed has bikes in it. And a kettle, and Dev's sandwiches."
  - dev: "The sandwiches are temporary."
code: |
  # Dev's shed: a kind of list
  class Shed(list):
      pass


  # Kat's shed: has a list
  class Shed:
      def __init__(self):
          self.bikes = []

      def add(self, bike):
          self.bikes.append(bike)
prompt: "Dev's shed is a kind of list. Kat's shed has a list. Which would you rather hand to a customer at the counter, and why?"
answer: "Kat's. A shed is not a kind of list, so Dev's would let anyone call `sort()`, `clear()` or `pop()` on it. Kat's keeps the list inside and offers only what a shed should do. Ask whether it is a kind of the other thing (inherit) or has one (compose). An electric bike is a bike; a shed has bikes."
concept: composition
---
Kat's way is **composition**: build a thing out of the other things it has, kept in its attributes, rather than making it a kind of something.

Moss's rule of thumb: if "is a" sounds right, inherit. If "has a" sounds right, compose. When neither sounds right, you've probably named the class wrong.
