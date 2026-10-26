def square():
    return "\n".join("".join(f"{row * col:4}" for col in range(1, 13)) for row in range(1, 13))


def trainer(table, answers):
    lines = [f"{n:2} x {table} = {n * table:3}" for n in range(1, 13)]
    lines.append("Quiz time.")
    score = 0
    for n, answer in zip(range(8, 13), answers):
        if answer == n * table:
            lines.append("Right.")
            score = score + 1
        else:
            lines.append(f"No, {n * table}.")
    lines.append(f"Score: {score} out of 5")
    return "\n".join(lines)


TESTS = [
    output("0 gives the whole square", inputs=["0"], expect=square(), visible=True),
    output("7 still gives the sevens", inputs=["7", "56", "63", "70", "77", "84"],
           expect=trainer(7, [56, 63, 70, 77, 84]), visible=True),
]
