# Caitlin's class quiz, Thursdays at the Clocktower.
import json
import random

QUESTIONS = "questions.json"


def load_questions(path):
    """The questions in a JSON file, as a list of dictionaries."""
    with open(path) as file:
        return json.load(file)


# round_names(questions)
#   Only some items: if at the end, and curly brackets for a set

# round_sizes(questions)
#   key: value for a dictionary

# in_round(questions, name)

# is_right(given, question)

# score(questions, answers)

# answer_sheet(questions, answers)
#   A value for every item: if-else at the front

# main()
#   Doing, not building: a plain loop


if __name__ == "__main__":
    main()
