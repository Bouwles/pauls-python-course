---
id: plan
type: reading
title: How Paul would break it down
dialogue:
  - paul: "Big jobs are small jobs in a row. Write the row down first."
---
Before any code, Paul writes the subgoals on the chalkboard:

1. **Decide what the program remembers.** One list, `expenses`, with a dictionary for each receipt.
2. **Add one expense.** Ask, tidy, try the amount, and only then append a dictionary.
3. **The menu loop.** Ask, branch, go round again. Leave on `5`.
4. **One function per job.** Totals by category, and the biggest expense, each return an answer. Listing and the menu print.
5. **The empty case.** Every option has to cope with no expenses at all.
6. **Try to break it.** `twenty`, `0`, `-5`, a `7`, ` Travel ` and `travel`. Aaesha will.

A function given `expenses` gets a second label on the same list, so appending inside it changes the one list `main()` keeps. Two names for one list caught people out in the To-Do List. Here it works for you.
