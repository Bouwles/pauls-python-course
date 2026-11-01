---
id: worked
type: worked
title: How Paul would chain it
dialogue:
  - paul.pleased: "A treasure hunt. Each clue only knows where the next one is. That's enough to finish."
code: |
  class Clue:
      def __init__(self, name):
          self.name = name
          self.next = None


  class Hunt:
      def __init__(self):
          self.first = None

      def add(self, name):
          clue = Clue(name)
          if self.first is None:
              self.first = clue
              return
          last = self.first
          while last.next is not None:
              last = last.next
          last.next = clue

      def names(self):
          found = []
          clue = self.first
          while clue is not None:
              found.append(clue.name)
              clue = clue.next
          return found


  hunt = Hunt()
  for name in ["Front door", "Stairwell", "Roof"]:
      hunt.add(name)
  print(hunt.names())
subgoals:
  - label: Each link knows its own thing and the next link
    lines: [1, 4]
  - label: The chain only knows its first link
    lines: [7, 9]
  - label: Make the new link
    lines: [12, 12]
  - label: "An empty chain: the new link is the first"
    lines: [13, 15]
  - label: Otherwise walk to the last link and hang it on
    lines: [16, 19]
  - label: Walk from the first link until there isn't a next one
    lines: [21, 27]
explain:
  prompt: "Why does `add` walk while `last.next is not None`, but `names` walks while `clue is not None`?"
  answer: "`add` has to stop on the last clue, so it can hang the new one on it: it stops when there's no next one. `names` has to visit every clue, the last one too, so it only stops once it has stepped off the end."
  concept: linked-lists
---
A linked list keeps its items in links that point to each other, not in numbered slots. Reaching the hundredth link means walking past ninety-nine, so looking things up is O(n). But putting a link in, or taking one out, changes an arrow or two and moves nothing else.

Press Step through and watch the objects: every `next` is an arrow to the following clue.
