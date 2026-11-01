TESTS = [
    output("Undo puts it back in its place",
           inputs=["add", "Frames", "add", "Pens", "add", "Posters", "done", "2", "undo", "list", "quit"],
           expect="Done: Pens\nBack: Pens\n1. Frames\n2. Pens\n3. Posters\nLeft to do: 3", visible=True, timeout=3),
    output("Nothing to undo", inputs=["add", "Frames", "undo", "quit"], expect="Nothing to undo.\nLeft to do: 1",
           visible=True, timeout=3),
    output("Undo the first one", inputs=["add", "Frames", "add", "Pens", "done", "1", "undo", "list", "quit"],
           expect="Done: Frames\nBack: Frames\n1. Frames\n2. Pens\nLeft to do: 2", timeout=3),
]
