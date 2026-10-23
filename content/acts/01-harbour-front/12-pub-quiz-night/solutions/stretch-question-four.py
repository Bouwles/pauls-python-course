questions = [
    "Who keeps the lighthouse?",
    "What year was the big storm?",
    "What colour is this pub's door?",
    "What year was the big storm?",
    "What is the champion crab called?",
]
answers = ["Tom", "1987", "green", "1987", "Sir Reginald"]


def is_correct(given, answer):
    return given.strip().lower() == answer.lower()


def verdict(score, total):
    if score == total:
        return "Full marks. Gwen is checking your sleeves."
    elif score == 0:
        return "Not one. Impressive, in its way."
    elif score * 2 >= total:
        return "Respectable."
    else:
        return "There's always next Tuesday."


def main():
    score = 0
    asked = []
    for i in range(len(questions)):
        if questions[i] in asked:
            continue
        asked.append(questions[i])
        given = input(questions[i] + " ")
        if is_correct(given, answers[i]):
            print("Right.")
            score = score + 1
        else:
            print(f"No. It was {answers[i]}.")
    print(f"You scored {score} out of {len(asked)}.")
    print(verdict(score, len(asked)))


if __name__ == "__main__":
    main()
