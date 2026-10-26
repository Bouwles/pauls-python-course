def calculate(a, op, b):
    if op == "+":
        return a + b
    elif op == "-":
        return a - b
    elif op == "*":
        return a * b
    elif op == "/":
        return a / b


while True:
    text = input("Sum? ")
    if text == "quit":
        break
    parts = text.split()
    try:
        answer = calculate(float(parts[0]), parts[1], float(parts[2]))
        print(f"= {answer:.2f}")
    except ValueError:
        print("Those aren't both numbers.")
