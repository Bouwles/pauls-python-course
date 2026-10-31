# Paul's Friday quiz. Aaesha says question four repeats question two. Leave it.
ANSWERS = ["Guido", "1991", "four", "1991", "The Zen of Python"]


def tidy(answer):
    """Lower case, single spaces, and no 'the ' at the start."""
    tidied = " ".join(answer.lower().split())
    if tidied.startswith("the "):
        tidied = tidied[4:]
    return tidied


def split_sheet(line):
    """One line of answers, separated by commas, as a list of tidied answers."""
    sheet = []
    for answer in line.split(","):
        sheet.append(tidy(answer))
    return sheet


def wrong_answers(sheet, answers):
    """Question numbers, from 1, where the sheet's answer isn't the right one."""
    wrong = []
    for index in range(len(answers)):
        if index >= len(sheet) or tidy(sheet[index]) != tidy(answers[index]):
            wrong.append(index + 1)
    return wrong


def main():
    team = input("Team? ")
    sheet = split_sheet(input("Answers? "))
    wrong = wrong_answers(sheet, ANSWERS)
    print(f"{team}: {len(ANSWERS) - len(wrong)} out of {len(ANSWERS)}")
    if wrong:
        numbers = []
        for number in wrong:
            numbers.append(str(number))
        print("Wrong: " + ", ".join(numbers))


if __name__ == "__main__":
    main()
