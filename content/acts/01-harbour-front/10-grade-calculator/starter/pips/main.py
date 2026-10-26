def grade(mark):
    if mark >= 70:
        print("A")
    elif mark >= 60:
        print("B")
    elif mark >= 50:
        print("C")
    elif mark >= 40:
        print("D")
    else:
        print("F")


def main():
    name = "Sanjay"
    mean = 53.7
    print(f"{name}: {mean:.1f} ({grade(mean)})")


if __name__ == "__main__":
    main()
