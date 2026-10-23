---
id: review
type: reading
title: Moss reads it
dialogue:
  - moss: "It works. Now I read it. Different job."
code: |
  # Agnes counts a trip when the boat is back, not when it leaves.
  def log_in(boat, out, trips):
      if boat not in out:
          print(f"{boat} isn't out.")
          return
      out.remove(boat)
      trips[boat] = trips.get(boat, 0) + 1
      print(f"{boat} logged in.")
---
Moss reads every program twice: once to see that it works, and once to see whether the next person could mend it. His list for this one:

- **Honest names.** `out` and `trips`, not `l` and `d`. A boat is `boat` everywhere.
- **One job per function.** If `main()` is longer than the rest put together, something in it wants its own name.
- **Nothing written twice.** Asking for a boat and tidying it happens for both 1 and 2. Once is enough.
- **Comments say why.** The one above `log_in` earns its place. `# add one` wouldn't.
- **Read it aloud.** A line that is hard to say is hard to read.

Go through yours against the list. Change what you'd change, then check it again.
