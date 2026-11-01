# Yahya's calculator. Type a sum, get the answer, and never fall over.


def calculate(a, op, b):
    if op == "+":
        return a + b
    elif op == "-":
        return a - b
    elif op == "*":
        return a * b
    elif op == "/":
        return a / b
    return None


def main():
    while True:
        # Ask, tidy, and leave on the word that ends it
        text = input("Sum? ").strip()
        if text == "quit":
            print("Done for today.")
            break
        # Check the shape before anything else
        parts = text.split()
        if len(parts) != 3:
            print("Write it like 12 * 4, with spaces.")
            continue
        # Try the part that can fail
        try:
            answer = calculate(float(parts[0]), parts[1], float(parts[2]))
        # Catch each error by name
        except ValueError:
            print("Those aren't both numbers.")
        except ZeroDivisionError:
            print("Nothing divides by zero.")
        # Only print the answer if nothing went wrong
        else:
            if answer is None:
                print("Use +, -, * or /.")
            else:
                print(f"= {answer:.2f}")


# Run main() when the file is run
if __name__ == "__main__":
    main()
