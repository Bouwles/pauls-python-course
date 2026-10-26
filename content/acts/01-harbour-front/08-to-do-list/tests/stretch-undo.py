TESTS = [
    output("Undo puts it back in its place",
           inputs=["add", "Post", "add", "Stamps", "add", "Scales", "done", "2", "undo", "list", "quit"],
           expect="Done: Stamps\nBack: Stamps\n1. Post\n2. Stamps\n3. Scales\nLeft to do: 3", visible=True, timeout=3),
    output("Nothing to undo", inputs=["add", "Post", "undo", "quit"], expect="Nothing to undo.\nLeft to do: 1",
           visible=True, timeout=3),
    output("Undo the first one", inputs=["add", "Post", "add", "Stamps", "done", "1", "undo", "list", "quit"],
           expect="Done: Post\nBack: Post\n1. Post\n2. Stamps\nLeft to do: 2", timeout=3),
]
