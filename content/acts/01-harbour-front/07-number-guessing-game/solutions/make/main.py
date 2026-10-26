# Number guessing game for the Drowned Anchor
import random

# 1. Set up the secret and the counter
secret = random.randint(1, 100)
guesses = 0

# 2. Keep going until something stops it
while True:
    # 3. Ask, and stop on the quit word
    reply = input("Guess? ")
    if reply == "q":
        print(f"It was {secret}.")
        break
    # 4. Skip a daft guess without counting it
    guess = int(reply)
    if guess < 1 or guess > 100:
        print("Between 1 and 100.")
        continue
    # 5. Count the try
    guesses = guesses + 1
    # 6. Stop on a win
    if guess == secret:
        print(f"Got it in {guesses}.")
        break
    # 7. React to a miss
    if guess < secret:
        print("Too low.")
    else:
        print("Too high.")
