---
id: make
type: make
title: Make the guessing game
on_pass: { caitlin.pleased.cheer: "Got it in three. That's the score to beat. It needs a leaderboard next." }
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
        entry = input("Guess? ")
        if entry == ___:
            print(f"It was {secret}.")
            ___
        guess = int(entry)
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
Write Caitlin's game. Pick the number with `random.randint(1, 100)`.

```
Guess? 50
Too high.
Guess? 25
Too low.
Guess? 37
Got it in 3.
```

`q` prints `It was 37.` (the real number) and ends the game. A guess below 1 or above 100 gets `Between 1 and 100.` and doesn't count.

Use `while True`, with a `break` for each way to finish and a `continue` for a guess that doesn't count, as in Paul's padlock. The labels from his program are in the file.

The checks fix the number, then try a win, a `q`, a right first guess, and guesses of 0, 100 and 150. While you test it yourself, `print(secret)` near the top saves a lot of guessing. Take it out before you press **Check**.
