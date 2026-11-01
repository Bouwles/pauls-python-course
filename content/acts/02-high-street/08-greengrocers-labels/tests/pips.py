import json

OTHER_BANK = json.dumps([
    {"round": "Local", "question": "Who keeps a duck on their desk?", "answer": "Neil"},
    {"round": "Music", "question": "How many lines are on a musical stave?", "answer": "5"},
    {"round": "Local", "question": "Who runs the Studio?", "answer": "Caitlin"},
])

TESTS = [
    output("Caitlin's Local round", visible=True,
           expect="What time has the Clocktower's clock said for years?\nWhat colour is the duck on Neil's desk?\n"
                  "Which floor of the Clocktower is the Studio on?\nHow many spaces does Python use for one indent?",
           hint="An if that decides which items to keep goes at the end, after the for."),
    output("Another question book", files={"questions.json": OTHER_BANK},
           expect="Who keeps a duck on their desk?\nWho runs the Studio?"),
    structure("Still a comprehension", requires=["ListComp"],
              message="Keep it as a list comprehension: move the if, don't swap it for a loop."),
]
