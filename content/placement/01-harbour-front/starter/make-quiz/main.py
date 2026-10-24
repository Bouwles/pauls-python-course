# Gwen's answer sheets. Question four is the same as question two. Leave it.
ANSWERS = ["Old Tom", "1987", "green", "1987", "The Kraken"]


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
