import json
import random

BANK = [
    {"round": "Harbour", "question": "Who is the harbour master?", "answer": "Agnes Rook", "also": ["Agnes", "Mrs Rook"]},
    {"round": "Bakery", "question": "What is Bea's surname?", "answer": "Hollis"},
    {"round": "Harbour", "question": "What does a ferry captain steer?", "answer": "a ferry", "also": ["ferry", "the ferry"]},
    {"round": "Harbour", "question": "Which bird keeps the harbour office?", "answer": "a rook", "also": ["rook"]},
    {"round": "Bakery", "question": "How many loaves in a baker's dozen?", "answer": "13", "also": ["thirteen"]},
]
SEAL = {"round": "Sea", "question": "What is a baby seal called?", "answer": "a pup", "also": ["pup", "seal pup"]}
GOLD = {"round": "Science", "question": "What is the chemical symbol for gold?", "answer": "Au"}

SEA_NIGHT = """Rounds: Local (4), Science (4), Sea (4), Words (4)
1. What is the lowest point of the tide called?
2. What is a baby seal called?
3. How many hearts does an octopus have?
4. What do you call a speed of one nautical mile an hour?
Answers:
1. low water: right
2. a pup: you said kitten
3. 3: right
4. a knot: right
Score: 3 out of 4"""


def reversed_shuffle(items):
    items.reverse()


def quiz_night(inputs, files=None):
    """Run the quiz with random.shuffle swapped for one that reverses, so the order is known."""
    def check(ctx):
        old = random.shuffle
        random.shuffle = reversed_shuffle
        try:
            return ctx.run_program(inputs=inputs, files=files)
        finally:
            random.shuffle = old
    return check


def night_output(inputs, expect, message, files=None):
    def check(ctx):
        result = quiz_night(inputs, files)(ctx)
        if result.error is not None:
            raise CheckFailed(f"The quiz crashed: {type(result.error).__name__}: {result.error}", expected=expect, actual=result.output)
        got = "\n".join(line.rstrip() for line in result.output.strip().splitlines())
        if got != expect:
            raise CheckFailed(message, expected=expect, actual=got)
    return check


def different_orders(ctx):
    firsts = set()
    for seed in range(8):
        result = ctx.run_program(inputs=["sea", "a", "b", "c", "d"], seed=seed)
        lines = result.lines()
        if len(lines) > 1:
            firsts.add(lines[1])
    if len(firsts) < 2:
        raise CheckFailed("Eight quiz nights started with the same question. Shuffle the round's questions with random.shuffle before asking them.", actual=", ".join(sorted(firsts)))


TESTS = [
    custom("Quiz night: the Sea round", night_output(["sea", "low water", "kitten", "three", "Knots"], SEA_NIGHT,
                                                      "With the questions in a known order, the night should go like this."), visible=True),
    function("The rounds, in alphabetical order", call="round_names", args=(BANK,), expect=["Bakery", "Harbour"], visible=True,
             hint="A set comprehension gives each round once; sorted() puts them in order and makes a list."),
    function("round_names of an empty book", call="round_names", args=([],), expect=[]),
    function("How many in each round", call="round_sizes", args=([SEAL, GOLD, SEAL],), expect={"Science": 1, "Sea": 2},
             hint="A dictionary comprehension: for each name in round_names, the name and how many questions are in that round."),
    function("in_round keeps the book's order, whatever the capitals", call="in_round", args=(BANK, " HARBOUR "),
             expect=[BANK[0], BANK[2], BANK[3]],
             hint="Compare the rounds in lower case, with the spaces stripped off the name typed. Keep the questions in the order they're in the book."),
    function("in_round with no such round", call="in_round", args=(BANK, "Sport"), expect=[]),
    function("is_right with the answer", call="is_right", args=("a pup", SEAL), expect=True),
    function("is_right with an answer Gwen also allows", call="is_right", args=(" Seal Pup ", SEAL), expect=True,
             hint="The also list holds other answers Gwen accepts. Capitals and spaces at the ends don't count."),
    function("is_right with a wrong answer", call="is_right", args=("kitten", SEAL), expect=False),
    function("is_right with no also list", call="is_right", args=("au", GOLD), expect=True,
             hint="Not every question has an also. question.get(\"also\", []) gives an empty list for those."),
    function("score", call="score", args=([SEAL, GOLD, SEAL], ["pup", "Ag", "PUP"]), expect=2),
    function("score with nothing asked", call="score", args=([], []), expect=0),
    function("answer_sheet", call="answer_sheet", args=([GOLD, SEAL], ["Au", "a calf"]),
             expect=["1. Au: right", "2. a pup: you said a calf"],
             hint="One line per question, numbered from 1: the answer, then right, or what was said instead."),
    custom("A round that isn't there, then one that is", night_output(
        ["Sport", "  local ", "62", "the drowned anchor", "Lady Agatha", "97"],
        "Rounds: Local (4), Science (4), Sea (4), Words (4)\nNo round called Sport.\n"
        "1. What frequency was the old harbour radio on?\n2. What is the pub on the harbour front called?\n"
        "3. Which crab won the autumn cup on whelks?\n4. Since what year has Old Tom kept the lighthouse?\n"
        "Answers:\n1. 96.4: you said 62\n2. The Drowned Anchor: right\n3. Lady Agatha: right\n4. 1962: you said 97\nScore: 2 out of 4",
        "Ask again until the round is one of Gwen's, whatever its capitals.")),
    custom("Another question book", night_output(
        ["bakery", "twelve", "hollis"],
        "Rounds: Bakery (2), Harbour (3)\n1. How many loaves in a baker's dozen?\n2. What is Bea's surname?\n"
        "Answers:\n1. 13: you said twelve\n2. Hollis: right\nScore: 1 out of 2",
        "The quiz should work with any question book, however many rounds it has.",
        files={"questions.json": json.dumps(BANK)})),
    custom("A different order every week", different_orders),
    structure("Comprehensions", requires=["ListComp", "SetComp", "DictComp"],
              message="Use comprehensions, as the brief says: a list one, a set one and a dictionary one, at least."),
]
