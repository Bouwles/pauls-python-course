---
id: investigate
type: investigate
title: A hand nobody chose
concept: random-module
code: |
  import random

  HANDS = ["rock", "paper", "scissors"]
  machine = random.choice(HANDS)
  print(f"I chose {machine}.")
  print(f"Still {machine}.")
tasks:
  - id: same
    prompt: "Run it a few times. Do the two lines ever show different hands?"
    kind: answer
    accept: ["no", "never", "no, never"]
    feedback: "No. `random.choice` picks once, on line 4, and `machine` keeps that hand. Reading a variable never picks again."
    wrong: "Look at both lines of one run. The second line only reads `machine`."
  - id: one-hand
    prompt: "Change `HANDS` to `[\"rock\"]` and run it. What is the first line now?"
    kind: answer
    accept: ["I chose rock.", "I chose rock"]
    feedback: "`I chose rock.` `random.choice` only ever picks from the list you give it. With one item, that's not much of a choice."
  - id: beats
    prompt: "Put `HANDS` back. Then write `beats(a, b)`, which returns `True` if hand `a` beats hand `b` and `False` if not. Use this dictionary, where each hand's value is the hand it beats: `BEATS = {\"rock\": \"scissors\", \"paper\": \"rock\", \"scissors\": \"paper\"}`."
    kind: run
    tests: |
      TESTS = [
          function("Rock beats scissors", call="beats", args=("rock", "scissors"), expect=True,
                   hint="BEATS[a] is the hand that a beats. Compare it with b, and return what the comparison gives."),
          function("Rock doesn't beat paper", call="beats", args=("rock", "paper"), expect=False),
          function("Paper beats rock", call="beats", args=("paper", "rock"), expect=True),
          function("Scissors doesn't beat scissors", call="beats", args=("scissors", "scissors"), expect=False),
      ]
    solution: |
      import random

      HANDS = ["rock", "paper", "scissors"]
      BEATS = {"rock": "scissors", "paper": "rock", "scissors": "paper"}


      def beats(a, b):
          return BEATS[a] == b


      machine = random.choice(HANDS)
      print(f"I chose {machine}.")
      print(f"Still {machine}.")
---
`random.choice(a_list)` picks one item from a list, each as likely as the others. It lives in the same `random` module as `randint`, from Caitlin's guessing game.
