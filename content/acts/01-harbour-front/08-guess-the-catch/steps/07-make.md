---
id: make
type: make
title: Make Guess the Catch
on_pass: { gwen: "Got it in three. Better than anyone managed last night." }
hints:
  nudge: "The loop can end two ways: a win, or no guesses left. How does the code after the loop know which one happened?"
  plan:
    - Set up what you're guessing
    - Give a fixed number of tries
    - Ask inside the loop
    - Skip a daft answer
    - Leave early on a win
    - React to a miss
    - After the loop, check how it ended
  shape: |
    import ___

    catch = random.___(1, 20)
    for tries in range(1, ___):
        guess = int(input("Guess? "))
        if guess < 1 ___ guess > 20:
            print("Between 1 and 20.")
            ___
        if guess == catch:
            print(f"Got it in {tries}.")
            ___
        if guess < catch:
            print("Too low.")
        else:
            print("Too high.")
    if guess ___ catch:
        print(f"Out of guesses. It was {catch}.")
---
Write Gwen's game. A number from 1 to 20, picked with `random.randint(1, 20)`, and five guesses.

```
Guess? 10
Too high.
Guess? 5
Too low.
Guess? 7
Got it in 3.
```

A guess outside 1 to 20 gets `Between 1 and 20.` and still costs a guess. After five misses: `Out of guesses. It was 7.`

The checks fix the catch at a known number, so take out any `print(catch)` before you press **Check**.
