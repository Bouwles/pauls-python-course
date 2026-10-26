def trainer(table, answers):
    """What the trainer should print for this table and these five answers."""
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


def play(table, answers):
    return [str(table)] + [str(a) for a in answers]


TESTS = [
    output("Sevens, one slip", inputs=play(7, [56, 62, 70, 77, 84]), expect=trainer(7, [56, 62, 70, 77, 84]), visible=True),
    output("Threes, all right", inputs=play(3, [24, 27, 30, 33, 36]), expect=trainer(3, [24, 27, 30, 33, 36]), visible=True),
    output("Nines, all wrong", inputs=play(9, [1, 2, 3, 4, 5]), expect=trainer(9, [1, 2, 3, 4, 5]),
           hint="Every answer wrong: five No lines, each with the real answer, and a score of 0."),
    output("Twelves", inputs=play(12, [96, 108, 120, 132, 144]), expect=trainer(12, [96, 108, 120, 132, 144]),
           hint="144 needs all three characters of the answer column. Is the answer's width 3?"),
    output("Ones", inputs=play(1, [8, 9, 10, 11, 12]), expect=trainer(1, [8, 9, 10, 11, 12]),
           hint="Line the columns up: the first number in 2 characters, {n:2}, and the answer in 3."),
    output("Sixes, the last one wrong", inputs=play(6, [48, 54, 60, 66, 70]), expect=trainer(6, [48, 54, 60, 66, 70]),
           hint="A wrong answer at the end shouldn't wipe out the score. Is score set to 0 once, before the loop?"),
    output("Fours, two wrong", inputs=play(4, [32, 35, 40, 44, 49]), expect=trainer(4, [32, 35, 40, 44, 49])),
    structure("Uses for loops", requires=["For"],
              message="Twelve lines and five questions: use for loops, not seventeen prints."),
]
