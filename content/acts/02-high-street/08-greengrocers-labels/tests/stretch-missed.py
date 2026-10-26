SEAL = {"round": "Sea", "question": "What is a baby seal called?", "answer": "a pup", "also": ["pup", "seal pup"]}
GOLD = {"round": "Science", "question": "What is the chemical symbol for gold?", "answer": "Au"}
SPIDER = {"round": "Science", "question": "How many legs does a spider have?", "answer": "8", "also": ["eight"]}

TESTS = [
    function("Two missed out of three", call="missed", args=([SEAL, GOLD, SPIDER], ["kitten", "au", "six"]),
             expect=["What is a baby seal called?", "How many legs does a spider have?"], visible=True),
    function("Nothing missed", call="missed", args=([GOLD], [" AU "]), expect=[],
             hint="Use is_right, so capitals and spaces are forgiven here too."),
]
