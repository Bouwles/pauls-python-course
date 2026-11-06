---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral: "This is how I cost the class's server time. A menu, and one option that needs a second question."
code: |
  # The cost of running the class's code on a hired server
  print("1. Quick script")
  print("2. Training run")
  choice = input("Choose 1 or 2: ")

  if choice == "1":
      print("That's 0.85.")
  elif choice == "2":
      hours = float(input("Hours? "))
      if hours <= 2:
          cost = 3.35
      else:
          cost = 3.35 + (hours - 2) * 1.20
      print(f"That's {cost:.2f}.")
  else:
      print("No such option.")
inputs: ["2", "4"]
subgoals:
  - label: Show the menu and ask
    lines: [2, 4]
  - label: Choose what to do, one option at a time
    lines: [6, 8]
  - label: Decide again inside the option that has a special case
    lines: [9, 14]
  - label: Catch everything else
    lines: [15, 16]
explain:
  prompt: "Why is the hours question inside the `elif`, and not up at the top with the menu?"
  answer: "Only training runs are charged by the hour. Asked at the top, it would ask about hours for every quick script too. Inside the `elif`, it's only asked once Python knows it's a training run."
  concept: nested-conditions
---
A program like Neil's converter: Paul's menu for the cost of hiring server time. Option 2 needs a second question, so it has an `if` inside it. Run it with `2` and `4` hours: the first two hours cost 3.35, then 1.20 for each hour after, so 5.75.

The `else` at the bottom catches anything that isn't on the menu: a `3`, a typo, an empty answer.

The four labels beside the code are Paul's steps. Your file for the Build starts with the same four, as comments.
