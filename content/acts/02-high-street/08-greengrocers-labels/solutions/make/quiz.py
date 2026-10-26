# Gwen's pub quiz, Thursdays at the Drowned Anchor.
import json
import random

QUESTIONS = "questions.json"


def load_questions(path):
    """The questions in a JSON file, as a list of dictionaries."""
    with open(path) as file:
        return json.load(file)


def round_names(questions):
    """The different rounds, in alphabetical order."""
    return sorted({question["round"] for question in questions})


def round_sizes(questions):
    """How many questions each round has."""
    return {name: len(in_round(questions, name)) for name in round_names(questions)}


def in_round(questions, name):
    """The questions in one round, in the order they're in the book. Capitals don't matter."""
    wanted = name.strip().lower()
    return [question for question in questions if question["round"].lower() == wanted]


def is_right(given, question):
    """True if the answer given is the answer, or one of the others Gwen allows."""
    allowed = {answer.lower() for answer in [question["answer"]] + question.get("also", [])}
    return given.strip().lower() in allowed


def score(questions, answers):
    """How many of the answers are right."""
    return len([given for question, given in zip(questions, answers) if is_right(given, question)])


def answer_sheet(questions, answers):
    """One line per question: the answer, and whether it was got."""
    return [
        f"{number}. {question['answer']}: right" if is_right(given, question)
        else f"{number}. {question['answer']}: you said {given.strip()}"
        for number, (question, given) in enumerate(zip(questions, answers), start=1)
    ]


def main():
    questions = load_questions(QUESTIONS)
    sizes = round_sizes(questions)
    print("Rounds: " + ", ".join(f"{name} ({count})" for name, count in sizes.items()))
    chosen = []
    while not chosen:
        name = input("Which round? ")
        chosen = in_round(questions, name)
        if not chosen:
            print(f"No round called {name.strip()}.")
    random.shuffle(chosen)
    answers = []
    for number, question in enumerate(chosen, start=1):
        print(f"{number}. {question['question']}")
        answers.append(input("> "))
    print("Answers:")
    for line in answer_sheet(chosen, answers):
        print(line)
    print(f"Score: {score(chosen, answers)} out of {len(chosen)}")


if __name__ == "__main__":
    main()
