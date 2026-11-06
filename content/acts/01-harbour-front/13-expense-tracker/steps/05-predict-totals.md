---
id: predict-totals
type: predict
title: Adding to a category
concept: dict-get
code: |
  amounts = {"food": 18.4}
  amounts["travel"] = amounts.get("travel", 0) + 212.0
  amounts["food"] = amounts.get("food", 0) + 6.5
  print(amounts)
question: What does this print?
options:
  - text: "{'food': 24.9, 'travel': 212.0}"
    correct: true
    feedback: "`travel` isn't a key yet, so `.get` gives 0 and line 2 makes it 212.0. `food` is there already, so `.get` gives 18.4 and line 3 adds 6.5."
  - text: "{'food': 6.5, 'travel': 212.0}"
    misconception: get-default-always
    feedback: "The 0 is only for a key that isn't there. `food` is already a key, so `.get` gives its value, 18.4, and 6.5 is added to that."
  - text: A KeyError
    misconception: get-missing-crashes
    error: KeyError
    feedback: "`.get` never crashes on a missing key. That's what it's for: `amounts.get(\"travel\", 0)` gives 0 until there's a travel total."
---
Food has a total already. Travel doesn't, yet.
