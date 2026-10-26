import json

OTHER_BANK = json.dumps([
    {"round": "Local", "question": "Who runs the scrapyard?", "answer": "Nell"},
    {"round": "Sea", "question": "What is the opposite of ebb?", "answer": "flood"},
    {"round": "Local", "question": "What does Mr Okonjo make?", "answer": "suits"},
])

TESTS = [
    output("Gwen's Local round", visible=True,
           expect="Since what year has Old Tom kept the lighthouse?\nWhich crab won the autumn cup on whelks?\n"
                  "What is the pub on the harbour front called?\nWhat frequency was the old harbour radio on?",
           hint="An if that decides which items to keep goes at the end, after the for."),
    output("Another question book", files={"questions.json": OTHER_BANK},
           expect="Who runs the scrapyard?\nWhat does Mr Okonjo make?"),
    structure("Still a comprehension", requires=["ListComp"],
              message="Keep it as a list comprehension: move the if, don't swap it for a loop."),
]
