# Marks for the class's first Python test, marked blind by candidate number.


def read_marks(text):
    marks = []
    for word in text.split():
        marks.append(int(word))
    return marks


def average(marks):
    if len(marks) == 0:
        return None
    return sum(marks) / len(marks)


def grade(mark):
    if mark >= 70:
        return "A"
    elif mark >= 60:
        return "B"
    elif mark >= 50:
        return "C"
    elif mark >= 40:
        return "D"
    else:
        return "F"


# Keep the asking and printing in main()
def main():
    every_mark = []
    name = input("Name? ")
    while name != "":
        marks = read_marks(input("Marks? "))
        every_mark = every_mark + marks
        mean = average(marks)
        if mean is None:
            print(f"{name}: no marks yet")
        else:
            print(f"{name}: {mean:.1f} ({grade(mean)})")
        name = input("Name? ")
    class_mean = average(every_mark)
    if class_mean is None:
        print("Class average: no marks yet")
    else:
        print(f"Class average: {class_mean:.1f}")


# Run main() when the file is run
if __name__ == "__main__":
    main()
