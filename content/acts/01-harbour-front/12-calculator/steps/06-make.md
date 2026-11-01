---
id: make
type: make
title: Make the calculator
timeout_ms: 15000
on_pass: { yahya.pleased: "Thirty over nought. It said no, politely, and asked for the next sum." }
hints:
  nudge: "There are three ways a sum can go wrong before there's an answer: the wrong shape, a word for a number, a zero to divide by. Which of those does `try` catch, and which do you check yourself?"
  plan:
    - Ask, tidy, and leave on the word that ends it
    - Check the shape before anything else
    - Try the part that can fail
    - Catch each error by name
    - Only print the answer if nothing went wrong
  shape: |
    def calculate(a, op, b):
        if op == "+":
            return a + b
        ...
        return ___


    def main():
        while True:
            text = input("Sum? ").___()
            if text == "quit":
                print("Done for today.")
                break
            parts = text.split()
            if len(parts) != ___:
                print("Write it like 12 * 4, with spaces.")
                continue
            try:
                answer = calculate(___(parts[0]), parts[1], ___(parts[2]))
            except ___:
                print("Those aren't both numbers.")
            except ___:
                print("Nothing divides by zero.")
            else:
                if answer is None:
                    print("Use +, -, * or /.")
                else:
                    print(f"= {answer:___}")
---
Build Yahya's calculator to the spec under **The job**. The comments in the file are Paul's labels from the Workshop tape.

The checks call `calculate` on its own, then type whole days of sums at the program: good ones, bad ones and some very bad ones, then `quit`.

Let `calculate` divide by zero if it's asked to. The `ZeroDivisionError` travels back up to the line that called it, inside your `try`, and the `except` there deals with it.
