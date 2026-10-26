---
id: a-bug
type: explain
title: "Interview: a bug you found"
dialogue:
  - moss: "Everyone has bugs. What they want to know is whether you have a method."
prompt: "Walk through a bug you found, and how you found it."
answer: "Agnes's tide table. `to_clock(1500)` gave `25:00`, for the first tide after midnight. Nothing crashed, which is why nobody had noticed: every time anyone tried was a daytime tide. I found it by writing tests for the edges on purpose: midnight, a minute after, a tide that runs into the next day. The third one failed. The fix was one line, taking the minutes modulo `24 * 60`. Then I kept the test, so the bug can't come back quietly. What I learned: the bug wasn't in the arithmetic. It was in what I'd assumed about the input."
---
Interviewers ask this to see how you work when something goes wrong. They want the method more than the bug.

Tell it in order: what you saw, what you expected, how you narrowed it down, what the cause was, how you fixed it, and how you made sure it stayed fixed. Name what helped: a failing test, the traceback read from the bottom, one well-placed `print`, Dennis.

Pick a bug that taught you something. "I forgot a colon" is true of everyone and interesting to nobody.
