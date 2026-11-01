---
id: pips
type: pips
title: Fix Riya's version
dialogue:
  - riya.pleased: "I made a quick phone list first, before the proper book. Every name I tried worked."
  - riya.confused: "Then Aaesha typed Yahya, and it said KeyError. Can you look? Something's off."
dialogue_after:
  - riya.thinking.think: "So a missing name isn't blank. It's a crash. I only ever tried the names I'd typed in."
hints:
  nudge: "What does `phones[name]` do when the name isn't a key at all? Read the traceback."
  plan:
    - Find the line that crashes
    - Ask for the name in a way that can't crash
    - Check the known names still work
  shape: |
    while name != "":
        if phones.___(name, "") == "":
            print(f"No number for {name}.")
        else:
            print(f"{name}: {phones[name]}")
        name = input("Name? ")
---
Run Riya's lookup and type `Yahya`, then a blank line. It should say:

```
No number for Yahya.
```

Fix it so names that aren't in the list don't crash it.
