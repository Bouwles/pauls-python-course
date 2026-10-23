---
id: worked
type: worked
title: A menu that goes round
dialogue:
  - moss: "Old Tom's lamp log. Four choices, one loop, and a way out."
code: |
  # Old Tom's lamp log: a menu that goes round until he says goodnight
  lamp_lit = False
  times_lit = 0

  while True:
      choice = input("1 light, 2 out, 3 status, 4 bed: ").strip()
      if choice == "1":
          if lamp_lit:
              print("Already lit.")
          else:
              lamp_lit = True
              times_lit = times_lit + 1
              print("Lamp lit.")
      elif choice == "2":
          lamp_lit = False
          print("Lamp out.")
      elif choice == "3":
          print(f"Lit: {lamp_lit}. Times tonight: {times_lit}.")
      elif choice == "4":
          print("Goodnight, Tom.")
          break
      else:
          print("Not an option.")
inputs: ["1", "1", "3", "9", "2", "4"]
subgoals:
  - label: Set up what the program remembers
    lines: [2, 3]
  - label: Ask for a choice, every time round
    lines: [5, 6]
  - label: One branch per option, refusing what makes no sense
    lines: [7, 18]
  - label: Leave the loop on quit
    lines: [19, 21]
  - label: Catch everything else
    lines: [22, 23]
explain:
  prompt: "Why does Tom's menu use `while True` and `break`, rather than `while choice != \"4\"`?"
  answer: "The choice only exists once `input()` has run, inside the loop. With `while True`, the loop asks first, and the `\"4\"` branch can say goodnight and leave at exactly the right moment."
---
Everything the program remembers is set up before the loop. Inside it, nothing is remembered except by changing those variables.

The last `else` catches every answer nobody planned for. Agnes's logbook will need one.
