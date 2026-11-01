---
id: a-bug
type: explain
title: "Interview: a bug you found"
dialogue:
  - paul.laughing: "Everyone has bugs. What they want to know is whether you have a method."
prompt: "Walk through a bug you found, and how you found it."
answer: "The Value Estimator. Every tile came out worth about minus ten, except the finish, which was worth ten. Nothing crashed, which is why it looked almost plausible. I followed one step by hand, writing down what `tile` held on each line. The update ran after the crab had moved on, so each tile was learning from its own value. The fix was swapping two lines. Then I kept a test that the finish stays at 0, so the bug can't come back quietly. What I learned: the sums were right. The order was wrong."
---
Interviewers ask this to see how you work when something goes wrong. They want the method more than the bug.

Tell it in order: what you saw, what you expected, how you narrowed it down, what the cause was, how you fixed it, and how you made sure it stayed fixed. Name what helped: a failing test, the traceback read from the bottom, one well-placed `print`, the duck.

Pick a bug that taught you something. "I forgot a colon" is true of everyone and interesting to nobody.
