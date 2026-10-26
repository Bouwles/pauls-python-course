# Gwen's rock paper scissors. First to three. The loser washes the glasses.
import random

HANDS = ["rock", "paper", "scissors"]
BEATS = {"rock": "scissors", "paper": "rock", "scissors": "paper"}
VERDICTS = {"you": "You win.", "me": "I win.", "draw": "A draw."}


def winner(player, machine):
    if player == machine:
        return "draw"
    if BEATS[player] == machine:
        return "you"
    return "me"


def main():
    # Set up the score before the loop
    score = {"you": 0, "me": 0, "draw": 0}
    while score["you"] < 3 and score["me"] < 3:
        # Ask, tidy, and leave on quit
        player = input("Rock, paper or scissors? ").strip().lower()
        if player == "quit":
            break
        # Refuse what isn't a choice
        if player not in HANDS:
            print("Rock, paper or scissors. Nothing else.")
            continue
        # Play one round and count it
        machine = random.choice(HANDS)
        result = winner(player, machine)
        score[result] = score[result] + 1
        print(f"I chose {machine}. {VERDICTS[result]}")
    # Report the score
    print(f"You {score['you']}, me {score['me']}, draws {score['draw']}.")
    if score["you"] == 3:
        print("You're off the glasses.")
    elif score["me"] == 3:
        print("You're on the glasses.")


# Run main() when the file is run
if __name__ == "__main__":
    main()
