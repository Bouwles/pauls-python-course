---
id: make
type: make
title: Make the guessing game
on_pass: { gwen: "Got it in three. Better than anyone managed last night." }
hints:
  nudge: "The game can end two ways, a win or a `q`. Where does each one `break`? And which guesses shouldn't be counted?"
  plan:
    - Set up the secret and the counter
    - Keep going until something stops it
    - Ask, and stop on the quit word
    - Skip a daft guess without counting it
    - Count the try
    - Stop on a win
    - React to a miss
  shape: |
    import ___

    secret = random.___(1, 100)
    guesses = 0
    while ___:
        reply = input("Guess? ")
        if reply == ___:
            print(f"It was {secret}.")
            ___
        guess = int(reply)
        if guess < 1 or guess > 100:
            print("Between 1 and 100.")
            ___
        guesses = ___
        if guess == secret:
            print(f"Got it in {guesses}.")
            ___
        if guess < secret:
            print("Too low.")
        else:
            print("Too high.")
---
Write Gwen's game. The number is from 1 to 100, picked with `random.randint(1, 100)`.

```
Guess? 50
Too high.
Guess? 25
Too low.
Guess? 37
Got it in 3.
```

`q` prints `It was 37.` (the real number) and ends the game. A guess outside 1 to 100 gets `Between 1 and 100.` and doesn't count.

While you test it, `print(secret)` near the top saves a lot of guessing. The checks fix the number themselves, so take it out before you press **Check**.
