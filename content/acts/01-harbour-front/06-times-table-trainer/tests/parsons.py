def square(size):
    return "\n".join("".join(f"{row * col:4}" for col in range(1, size + 1)) for row in range(1, size + 1))


TESTS = [
    output("Size 3", inputs=["3"], expect=square(3), visible=True),
    output("Size 1", inputs=["1"], expect=square(1),
           hint="One row with one number in it. The bare print() finishes each row, once per row."),
    output("Size 5", inputs=["5"], expect=square(5),
           hint="Each row should be on its own line. Is print() inside the outer loop but outside the inner one?"),
]
