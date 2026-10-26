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


def ask_target():
    while True:
        text = input("First to? ").strip()
        if text.isdigit() and int(text) > 0:
            return int(text)
        print("A whole number, please.")


def main():
    target = ask_target()
    score = {"you": 0, "me": 0, "draw": 0}
    while score["you"] < target and score["me"] < target:
        player = input("Rock, paper or scissors? ").strip().lower()
        if player == "quit":
            break
        if player not in HANDS:
            print("Rock, paper or scissors. Nothing else.")
            continue
        machine = random.choice(HANDS)
        result = winner(player, machine)
        score[result] = score[result] + 1
        print(f"I chose {machine}. {VERDICTS[result]}")
    print(f"You {score['you']}, me {score['me']}, draws {score['draw']}.")
    if score["you"] == target:
        print("You're off the glasses.")
    elif score["me"] == target:
        print("You're on the glasses.")


if __name__ == "__main__":
    main()
