import random

catch = random.randint(1, 20)
for guess_number in range(1, 6):
    guess = int(input("Guess? "))
    if guess == catch:
        print(f"Got it in {guess_number}.")
    elif guess < catch:
        print("Too low.")
    else:
        print("Too high.")
