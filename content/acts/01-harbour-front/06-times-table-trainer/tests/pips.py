def quiz(answers):
    lines = []
    score = 0
    for n, answer in zip(range(8, 13), answers):
        if answer == n * 9:
            lines.append("Right.")
            score = score + 1
        else:
            lines.append(f"No, {n * 9}.")
    lines.append(f"Score: {score} out of 5")
    return "\n".join(lines)


TESTS = [
    output("All five right", inputs=["72", "81", "90", "99", "108"], expect=quiz([72, 81, 90, 99, 108]), visible=True,
           hint="Five right answers should score 5. What happens to score at the top of every pass?"),
    output("The last one wrong", inputs=["72", "81", "90", "99", "107"], expect=quiz([72, 81, 90, 99, 107]), visible=True),
    output("The first one wrong", inputs=["70", "81", "90", "99", "108"], expect=quiz([70, 81, 90, 99, 108])),
    output("All wrong", inputs=["1", "2", "3", "4", "5"], expect=quiz([1, 2, 3, 4, 5])),
]
