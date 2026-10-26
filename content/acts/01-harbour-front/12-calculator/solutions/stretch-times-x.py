def calculate(a, op, b):
    if op == "+":
        return a + b
    elif op == "-":
        return a - b
    elif op == "*" or op == "x":
        return a * b
    elif op == "/":
        return a / b
    return None


def main():
    while True:
        text = input("Sum? ").strip()
        if text == "quit":
            print("Fair winds.")
            break
        parts = text.split()
        if len(parts) != 3:
            print("Write it like 12 * 4, with spaces.")
            continue
        try:
            answer = calculate(float(parts[0]), parts[1], float(parts[2]))
        except ValueError:
            print("Those aren't both numbers.")
        except ZeroDivisionError:
            print("Nothing divides by zero.")
        else:
            if answer is None:
                print("Use +, -, * or /.")
            else:
                print(f"= {answer:.2f}")


if __name__ == "__main__":
    main()
