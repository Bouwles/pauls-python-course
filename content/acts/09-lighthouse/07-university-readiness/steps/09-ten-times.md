---
id: ten-times
type: explain
title: "Interview: ten times as many"
dialogue:
  - paul.neutral: "A guess is fine. Say how you'd find out if it's right."
prompt: "What would break first if ten times as many people used your project, and how would you know?"
answer: "The berth booking app. Ten times the marina is fifty berths and about 4,000 bookings a year. Speed isn't the problem: saving rewrites the whole JSON file each time, and 4,000 rows take a blink. What breaks first is two skippers booking at the same moment. Both requests load the file, both add a booking, and the second save wipes out the first. With five berths that's rare; with fifty on a busy Saturday morning, it will happen. I'd know by logging every booking and checking the log against the file each week. The fix is a lock around loading and saving, or SQLite, which does the locking for me."
---
This question has a trap in it. Most people say "it would get slow" and stop. Slow is sometimes the answer, but then say what gets slow, by how much, and starting from which number.

Work it through. What grows with the users: rows in a file, requests at once, items in a loop? Which part of your code is O(n) in that, or O(n²)? What happens when two people do the same thing at the same instant?

Then the second half: how would you know? A test, a timing, a log line, a count that stops adding up. "I'd hear from the users" is honest, and not a good answer.
