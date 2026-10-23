import random

catch = random.randint(1, 20)
for tries in range(1, 6):
    guess = int(input("Guess? "))
    if guess < 1 or guess > 20:
        print("Between 1 and 20.")
        continue
    if guess == catch:
        print(f"Got it in {tries}.")
        break
    if guess < catch:
        print("Too low.")
    else:
        print("Too high.")
    if catch - 2 <= guess <= catch + 2:
        print("Close.")

if guess != catch:
    print(f"Out of guesses. It was {catch}.")
