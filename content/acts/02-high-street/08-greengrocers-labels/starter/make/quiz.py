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
#   Keep the round's questions in the book's order

# is_right(given, question)
#   Every answer Caitlin allows, in lower case

# score(questions, answers)

# answer_sheet(questions, answers)
#   A value for every item: if-else at the front

# main()
#   Ask until the round is a real one
#   Shuffle, ask, then mark
#   Doing, not building: a plain loop


# Runs main() when you run this file, but not when the checks import it.
if __name__ == "__main__":
    main()
