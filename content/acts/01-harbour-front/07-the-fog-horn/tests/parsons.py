TESTS = [
    output("Two ships", inputs=["Kestrel", "Mary Rose", "dawn"], expect="2 ships passed", visible=True, timeout=3),
    output("A quiet night", inputs=["dawn"], expect="0 ships passed", timeout=3,
           hint="If dawn comes first, the loop never runs. The counter still needs to exist."),
    output("Four ships", inputs=["Plover", "Tern", "Kestrel", "Gannet", "dawn"], expect="4 ships passed", timeout=3),
]
