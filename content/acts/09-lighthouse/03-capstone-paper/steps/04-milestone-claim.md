---
id: the-claim-restated
type: milestone
title: "Milestone 1: the claim, in your words"
test_plan: true
evidence: none
dialogue:
  - paul.neutral: "Explain it to someone who wasn't in the room. If they get it, you've got it."
  - caitlin.pleased: "Bigger is better. Done."
  - paul.unimpressed: "That's a headline, not a claim."
checklist:
  - id: own-words
    text: "You've written the claim in two or three sentences of your own, plain enough for someone outside the class."
    why: "If you can't say it plainly, you can't tell whether you've reproduced it."
  - id: measured
    text: "You've named what the paper measured: which model, which fit, which error, plotted against what."
    why: "A claim without its measurements is a rumour. Write down the measurements and it becomes something you can check."
  - id: success
    text: "You've written what would count as reproducing it, and what would count as failing, before running anything."
    why: "Decide what 'it worked' means before you see the result. Afterwards, it always works."
  - id: differences
    text: "You've listed how your small version differs from the paper's: the data, its size, the features, the number of seeds."
    why: "Every difference is a place a mismatch might come from. Write them down while you still remember them all."
  - id: plan
    text: "Your test plan has at least three tests for the pieces and the curve, each with the result you expect."
    why: "Paul reads the plan before the code. Tests you plan are better than tests you think of after it passes."
  - id: puzzle
    text: "You've read the paper's abstract and first figure, and written down one thing in them you don't yet understand."
    why: "Everyone skims past the part they don't understand. Write it down and you'll come back to it."
---
You've built the pieces and the curve. Before you trust either, say what you are testing.

Write the claim in your own words, plain enough for someone who wasn't in the room. Name what was measured: the model, the fit, the error, and what it's plotted against. Then the most important paragraph of the whole capstone: what result would count as reproducing it, and what would count as failing. Write it now, before you've drawn the figure, while you can still be surprised.

List every way your small version differs from the paper's. Each difference is a place where a mismatch might come from later.

Your test plan is for `test_descent.py`: the shapes, the seeds, and the facts the figure depends on.
