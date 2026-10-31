TESTS = [
    output("Undo puts it back in its place",
           inputs=["add", "Projector", "add", "Pens", "add", "Quizzes", "done", "2", "undo", "list", "quit"],
           expect="Done: Pens\nBack: Pens\n1. Projector\n2. Pens\n3. Quizzes\nLeft to do: 3", visible=True, timeout=3),
    output("Nothing to undo", inputs=["add", "Projector", "undo", "quit"], expect="Nothing to undo.\nLeft to do: 1",
           visible=True, timeout=3),
    output("Undo the first one", inputs=["add", "Projector", "add", "Pens", "done", "1", "undo", "list", "quit"],
           expect="Done: Projector\nBack: Projector\n1. Projector\n2. Pens\nLeft to do: 2", timeout=3),
]
