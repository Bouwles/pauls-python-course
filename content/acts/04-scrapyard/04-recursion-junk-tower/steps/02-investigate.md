---
id: investigate
type: investigate
title: The tower of calls
concept: call-stack
code: |
  def weigh(crate):
      total = 0
      for thing in crate:
          if isinstance(thing, list):
              total = total + weigh(thing)
          else:
              total = total + thing
      return total


  tower = [4, [2, 3], [1, [5, [6]]]]
  print(weigh(tower))
tasks:
  - id: tallest
    prompt: "Press Step through and go forward until the tower of crates is at its tallest. How many crates are in it?"
    kind: answer
    accept: ["4", "four", "4 crates", "four crates"]
    feedback: "Four: the whole tower, `[1, [5, [6]]]`, `[5, [6]]` and `[6]`, each call waiting for the one above it. The tower is as tall as the crates are deep."
    wrong: "Each crate is a call that hasn't finished. Go forward until `weigh([6])` is running, and count."
  - id: first-back
    prompt: "What is the first number any call gives back?"
    kind: answer
    accept: ["5", "five"]
    feedback: "5, from `weigh([2, 3])`. The first call to finish is the first one with no crates inside it to wait for. The whole tower's call finishes last."
    wrong: "Watch for the top crate saying gives. The call at the bottom of the tower can't finish until every call above it has."
  - id: middle
    prompt: "What does the call for `[1, [5, [6]]]` give back?"
    kind: answer
    accept: ["12", "twelve"]
    feedback: "12: its own 1 kg part, plus the 11 that `weigh([5, [6]])` gave back. It had to wait for that before it could finish."
    wrong: "Its own part, plus whatever the crate inside it gave back."
  - id: count
    prompt: "Change one line so the program prints how many parts the tower holds instead of how much they weigh."
    kind: run
    tests: |
      TESTS = [output("Six parts", expect="6",
                      hint="Every part adds 1, whatever it weighs. A crate inside still adds whatever its own call gives back.")]
    solution: |
      def weigh(crate):
          total = 0
          for thing in crate:
              if isinstance(thing, list):
                  total = total + weigh(thing)
              else:
                  total = total + 1
          return total


      tower = [4, [2, 3], [1, [5, [6]]]]
      print(weigh(tower))
---
A call that hasn't finished is waiting somewhere. Python keeps every waiting call in a pile called the **call stack**: the newest on top, and only the top one running.

The step-through draws it as a tower of crates, one crate per waiting call. When the top call returns, its crate says what it gives back, and comes off the pile.
