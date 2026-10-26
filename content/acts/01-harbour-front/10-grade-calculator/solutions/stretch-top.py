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


def main():
    every_mark = []
    top_name = None
    top_mean = None
    name = input("Name? ")
    while name != "":
        marks = read_marks(input("Marks? "))
        every_mark = every_mark + marks
        mean = average(marks)
        if mean is None:
            print(f"{name}: no marks yet")
        else:
            print(f"{name}: {mean:.1f} ({grade(mean)})")
            if top_mean is None or mean > top_mean:
                top_name = name
                top_mean = mean
        name = input("Name? ")
    class_mean = average(every_mark)
    if class_mean is None:
        print("Class average: no marks yet")
    else:
        print(f"Class average: {class_mean:.1f}")
        print(f"Top: {top_name} ({top_mean:.1f})")


if __name__ == "__main__":
    main()
