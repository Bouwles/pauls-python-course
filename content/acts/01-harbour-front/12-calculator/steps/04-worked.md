---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.laughing: "I measured the Workshop for new desks. Half my tape is in inches, and I type some odd things."
code: |
  # The Workshop tape: inches or feet to centimetres, until I say done
  CM_PER = {"in": 2.54, "ft": 30.48}


  def to_cm(amount, unit):
      return amount * CM_PER[unit]


  while True:
      text = input("Measure? ").strip()
      if text == "done":
          break
      parts = text.split()
      if len(parts) != 2:
          print("Like this: 32 in")
          continue
      try:
          cm = to_cm(float(parts[0]), parts[1])
      except ValueError:
          print(f"{parts[0]} isn't a number.")
      except KeyError:
          print(f"Inches or feet. Not {parts[1]}.")
      else:
          print(f"{cm:.1f} cm")
inputs: ["32 in", "six ft", "2 yd", "5 ft", "done"]
subgoals:
  - label: Ask, tidy, and leave on the word that ends it
    lines: [9, 12]
  - label: Check the shape before anything else
    lines: [13, 16]
  - label: Try the part that can fail
    lines: [17, 18]
  - label: Catch each error by name
    lines: [19, 22]
  - label: Only print the answer if nothing went wrong
    lines: [23, 24]
explain:
  prompt: "The KeyError for `yd` happens on line 6, inside `to_cm`. Why does the `except KeyError` on line 21 catch it?"
  answer: "An exception travels back up to the line that called the function, line 18. That line is inside the `try`, so the matching `except` underneath catches it, as if the error had happened right there."
  concept: exceptions
---
`else:` after the `except`s runs only when nothing went wrong, so the centimetres are printed only when there are some.

Each `except` names the one error it expects and says what was wrong. A bad measurement never stops the program: the loop just goes round again.
