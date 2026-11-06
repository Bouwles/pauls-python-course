---
id: first-slice
type: milestone
title: "Milestone 2: the first working slice"
evidence: link
dialogue:
  - paul.neutral.point: "Thin and working, from one end to the other. Then thicken it."
checklist:
  - id: end-to-end
    text: "The slice does one useful thing from start to finish, however plain it looks."
    why: "End to end, even plain, shows you every joint. A beautiful half shows you nothing."
  - id: tests
    text: "Every test in your plan exists and passes, along with any you thought of on the way."
    why: "A plan that isn't run is a wish list."
  - id: mutants
    text: "You've broken your main function on purpose in three small ways, and a test caught each one."
    why: "The postage step, on your own code. Any mistake your tests miss is a test you haven't written."
  - id: user-saw
    text: "The person it's for has seen the slice working, and you've written down what they said."
    why: "It's cheaper to hear 'not like that' now than at the handover."
  - id: history
    text: "The repository's history is small commits with honest messages."
    why: "'Fixed stuff' tells nobody anything, including you, next month."
  - id: fresh-copy
    text: "It runs from a fresh copy of the repository with the commands you've written down."
    why: "If it only runs on your computer, it doesn't run yet."
---
The first slice is the thinnest version that does one useful thing from end to end. For Riya's postage: weight and destination in, price out. No labels, no printer, but a real answer to a real question.

1. Turn your test plan into tests, then write the code that passes them, with the rules in plain functions and the input and output round the outside.
2. Make three mutants of your main function, and check a test catches each. If one survives, write the test that would have caught it.
3. Show the slice to the person it's for, and write down what they say.
4. Check it runs from a fresh copy, with the commands you've written down.

Done: every box below ticked.
