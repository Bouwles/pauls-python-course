# Guess the catch
import random

# 1. Set up what you're guessing
catch = random.randint(1, 20)

# 2. Give a fixed number of tries
for tries in range(1, 6):
    # 3. Ask inside the loop
    guess = int(input("Guess? "))
    # 4. Skip a daft answer
    if guess < 1 or guess > 20:
        print("Between 1 and 20.")
        continue
    # 5. Leave early on a win
    if guess == catch:
        print(f"Got it in {tries}.")
        break
    # 6. React to a miss
    if guess < catch:
        print("Too low.")
    else:
        print("Too high.")

# 7. After the loop, check how it ended
if guess != catch:
    print(f"Out of guesses. It was {catch}.")
