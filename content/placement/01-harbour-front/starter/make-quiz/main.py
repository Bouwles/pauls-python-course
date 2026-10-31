# Paul's Friday quiz. Aaesha says question four repeats question two. Leave it.
ANSWERS = ["Guido", "1991", "four", "1991", "The Zen of Python"]


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
