---
id: review
type: reading
title: Paul reads it
dialogue:
  - paul: "It works. Now I read it. Different job."
code: |
  def biggest(expenses):
      if len(expenses) == 0:
          return None
      largest = expenses[0]
      for expense in expenses:
          # > rather than >=, so a tie goes to the receipt added first.
          if expense["amount"] > largest["amount"]:
              largest = expense
      return largest
---
Paul reads every program twice: once to see that it works, and once to see whether the next person could mend it. His list for this one:

- **Honest names.** `expenses` and `expense`, not `l` and `e`. A category is `category` everywhere.
- **One job per function.** If `main()` is longer than the rest put together, something in it wants its own name.
- **Nothing written twice.** Checking for no expenses happens in three options. A small function, or one check before the branches, does it once.
- **Comments say why.** The one above the `>` earns its place. `# loop through` wouldn't.
- **Read it aloud.** A line that is hard to say is hard to read.

Go through yours against the list. Change what you'd change, then check it again.
