PIANO = {"round": "Music", "question": "Which instrument has 88 keys?", "answer": "the piano", "also": ["piano", "a piano", "grand piano"]}
GOLD = {"round": "Science", "question": "What is the chemical symbol for gold?", "answer": "Au"}
SPIDER = {"round": "Science", "question": "How many legs does a spider have?", "answer": "8", "also": ["eight"]}

TESTS = [
    function("Two missed out of three", call="missed", args=([PIANO, GOLD, SPIDER], ["keyboard", "au", "six"]),
             expect=["Which instrument has 88 keys?", "How many legs does a spider have?"], visible=True),
    function("Nothing missed", call="missed", args=([GOLD], [" AU "]), expect=[],
             hint="Use is_right, so capitals and spaces are forgiven here too."),
]
