---
id: make
type: make
title: Make the game
on_pass: { caitlin.laughing: "Three games, three different endings. It never once looked at anyone's face." }
hints:
  nudge: "What has to be true for the game to keep going? Put that in the `while` line, and let `quit` use `break`."
  plan:
    - Keep the choices in one list
    - "One job per function: pick, then decide"
    - Set up the score before the loop
    - Ask, tidy, and leave on quit
    - Refuse what isn't a choice
    - Play one round and count it
    - Report the score
  shape: |
    def winner(player, machine):
        if player == machine:
            return "draw"
        if BEATS[___] == ___:
            return "you"
        return "me"


    def main():
        score = {"you": 0, "me": 0, "draw": 0}
        while score["you"] < 3 and ___:
            player = input("Rock, paper or scissors? ").___().___()
            if player == "quit":
                break
            if player not in HANDS:
                print("Rock, paper or scissors. Nothing else.")
                continue
            machine = random.choice(___)
            result = winner(player, machine)
            score[result] = ___
            print(f"I chose {machine}. {VERDICTS[result]}")
        print(f"You {score['you']}, me {score['me']}, draws {score['draw']}.")
        ___
---
Write the game. The brief has the whole spec.

```
Rock, paper or scissors? rock
I chose scissors. You win.
Rock, paper or scissors? lizard
Rock, paper or scissors. Nothing else.
Rock, paper or scissors? quit
You 1, me 0, draws 0.
```

The rules are in the file already. `BEATS["rock"]` is `"scissors"`, the hand rock beats, and `VERDICTS` turns a result into what the machine says. Keep playing while neither side has three wins: a `while` test with `and`.

`winner` is checked on its own, so it returns its answer and prints nothing. The checks also decide the machine's hands in advance, so they can play whole games and know how each ends. That only works if the machine picks with `random.choice`, once per round.
