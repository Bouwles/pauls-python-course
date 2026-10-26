import random

secret = random.randint(1, 100)
guesses = 0

while True:
    reply = input("Guess? ")
    if reply == "q":
        print(f"It was {secret}.")
        break
    guess = int(reply)
    if guess < 1 or guess > 100:
        print("Between 1 and 100.")
        continue
    guesses = guesses + 1
    if guess == secret:
        print(f"Got it in {guesses}.")
        break
    if guess < secret:
        print("Too low.")
    else:
        print("Too high.")
    if secret - 5 <= guess <= secret + 5:
        print("Close.")
