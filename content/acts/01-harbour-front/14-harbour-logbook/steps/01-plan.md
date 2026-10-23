---
id: plan
type: reading
title: How Moss would break it down
dialogue:
  - moss: "Big jobs are small jobs in a row. Write the row down first."
---
Before any code, Moss writes the subgoals on the back of an envelope:

1. **Decide what the program remembers.** A list of boats that are out. A dictionary of trips for each boat.
2. **Tidy a name.** One small function that hands back the name stripped and with capitals.
3. **The menu loop.** Ask, branch, go round again. Leave on `4`.
4. **One function per option.** Out, in and report, each given the list or dictionary it needs.
5. **Quit properly.** Say which boats are still out.
6. **Try to break it.** A boat out twice, a boat that never left, a blank name, a `7`. Agnes will.

A function given `out` gets a second label on the same list, so appending inside it changes the one list. That's Bea's list again, working for you this time.
