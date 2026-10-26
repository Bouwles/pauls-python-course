---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Agnes settles berth arguments with a coin. Same shape of game, fewer hands."
code: |
  # Heads or tails against the machine, for Agnes's berth arguments
  import random

  SIDES = ["heads", "tails"]


  def toss():
      return random.choice(SIDES)


  def result(call, coin):
      if call == coin:
          return "you"
      return "me"


  def main():
      score = {"you": 0, "me": 0}
      while True:
          call = input("Heads or tails? ").strip().lower()
          if call == "quit":
              break
          if call not in SIDES:
              print("Heads or tails. It's a coin.")
              continue
          coin = toss()
          winner = result(call, coin)
          score[winner] = score[winner] + 1
          print(f"It's {coin}.")
      print(f"You {score['you']}, me {score['me']}.")


  if __name__ == "__main__":
      main()
inputs: ["heads", "edge", "Tails", "quit"]
subgoals:
  - label: Keep the choices in one list
    lines: [4, 4]
  - label: "One job per function: pick, then decide"
    lines: [7, 14]
  - label: Set up the score before the loop
    lines: [18, 18]
  - label: Ask, tidy, and leave on quit
    lines: [19, 22]
  - label: Refuse what isn't a choice
    lines: [23, 25]
  - label: Play one round and count it
    lines: [26, 29]
  - label: Report the score
    lines: [30, 30]
explain:
  prompt: "Why is `coin = toss()` inside the loop, and after the `continue`?"
  answer: "Inside the loop so there's a fresh toss every round; above the loop, the coin would land the same way all evening. After the `continue`, so a call that isn't heads or tails never uses up a toss."
  concept: random-module
---
`continue` jumps straight back to the top of the loop, so a call like `edge` never reaches the toss.

`result` hands back `"you"` or `"me"`, which are the keys of `score`, so one line counts the round whoever won it.
