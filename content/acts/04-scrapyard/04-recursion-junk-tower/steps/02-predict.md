---
id: predict
type: predict
title: A crate of crates
concept: recursion
code: |
  def weigh(crate):
      total = 0
      for thing in crate:
          if isinstance(thing, list):
              total = total + weigh(thing)
          else:
              total = total + thing
      return total


  tower = [4, [2, 3], [1, [5]]]
  print(weigh(tower))
question: What does this print?
options:
  - text: "15"
    correct: true
    feedback: "Right. `weigh` adds the parts it can see, and for each crate inside it asks `weigh` to weigh that crate. `weigh([1, [5]])` does the same, and asks `weigh([5])`."
  - text: "10"
    misconception: recursion-one-level-deep
    feedback: "That weighs the crates one level down but leaves out the 5 inside `[1, [5]]`. `weigh([1, [5]])` runs the same loop, finds a crate, and calls `weigh` again. However deep it goes, the same lines handle it."
  - text: An error, because weigh isn't finished when it calls itself
    misconception: self-call-is-error
    error: NameError
    feedback: "The `def` finished long before `weigh` is called, so the name exists. A function can call any function that exists when the call happens, itself included."
  - text: "It never stops: weigh keeps calling weigh"
    misconception: recursion-never-stops
    error: RecursionError
    feedback: "Each call is handed a smaller crate than the one before. A crate with no crates in it calls nothing, so every chain of calls comes to an end."
after: |
  Run it. Then put a 6 kg sprocket inside the `[5]`, predict again, and run it again.
---
The same `weigh`, on a tower that goes one crate deeper.
