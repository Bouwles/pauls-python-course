import random

HANDS = ["rock", "paper", "scissors"]
BEATS = {"rock": "scissors", "paper": "rock", "scissors": "paper"}


def winner(player, machine):
    if player == machine:
        return "draw"
    if BEATS[player] == machine:
        return "you"
    return "me"


def main():
    score = {"you": 0, "me": 0, "draw": 0}
    machine = random.choice(HANDS)
    for round_number in range(3):
        player = input("Rock, paper or scissors? ")
        result = winner(player, machine)
        score[result] = score[result] + 1
        print(f"I chose {machine}.")
    print(f"You {score['you']}, me {score['me']}, draws {score['draw']}.")


if __name__ == "__main__":
    main()
