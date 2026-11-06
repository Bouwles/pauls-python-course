---
id: predict-decorator
type: predict
title: The @ line
concept: decorators
code: |
  def loud(func):
      print("wrapping", func.__name__)

      def wrapper():
          return func().upper()
      return wrapper


  @loud
  def special():
      return "figs"


  print("shop open")
  print(special())
  print(special())
question: What does this print?
options:
  - text: |-
      wrapping special
      shop open
      FIGS
      FIGS
    correct: true
    feedback: "`loud` runs once, when the `def` runs, and hands back `wrapper`. From then on, the name `special` means `wrapper`, which calls the original and shouts it."
  - text: |-
      shop open
      wrapping special
      FIGS
      wrapping special
      FIGS
    misconception: decorator-runs-every-call
    feedback: "`loud` itself runs only once, as `special` is defined. What runs on every call is `wrapper`, and that doesn't print anything."
  - text: |-
      wrapping special
      shop open
      figs
      figs
    misconception: decorator-leaves-original
    feedback: "After `@loud`, the name `special` holds whatever `loud` handed back, which is `wrapper`. The original only runs when `wrapper` calls it."
---
A decorator that shouts the day's special.
