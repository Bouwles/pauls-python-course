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
The first slice is the thinnest version that does one useful thing from end to end. For Riya's postage: weight and destination in, price out. No labels, no printer, no queue, but a real answer to a real question.

Turn your test plan into tests first, then write the code that passes them. Keep the rules in plain functions and the input and output round the outside, as in Caitlin's game.

Then do to your own code what the checks did to Riya's postage: change a `<=` to a `<`, delete a check, alter a number. Run the tests each time. If a change survives, write the test that would have caught it.

Show the slice to the person it's for, and write down what they say.
