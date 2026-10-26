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
    name = "Sanjay"
    mean = 53.7
    print(f"{name}: {mean:.1f} ({grade(mean)})")


if __name__ == "__main__":
    main()
