---
id: make
type: make
title: Make the grade calculator
on_pass: { paul.proud: "Candidate 1, fifty-three point seven, a C. And every function checks out on its own." }
hints:
  nudge: "Which function needs `.split()`, which needs `len()`, and which only needs one number?"
  plan:
    - Name the job and what it needs
    - Work it out and hand it back
    - Keep the asking and printing in main()
    - Run main() when the file is run
  shape: |
    def read_marks(text):
        marks = []
        for word in text.___():
            marks.append(___(word))
        return marks

    def average(marks):
        if len(marks) == 0:
            return ___
        return ___ / len(marks)

    def grade(mark):
        if mark >= 70:
            return "A"
        elif ___:
            ...

    def main():
        every_mark = []
        name = input("Name? ")
        while name != "":
            marks = read_marks(input("Marks? "))
            every_mark = every_mark + marks
            mean = ___(marks)
            if mean is None:
                print(f"{name}: no marks yet")
            else:
                print(f"{name}: {mean:.1f} ({___})")
            name = input("Name? ")
        ___
---
Write `read_marks`, `average`, `grade` and `main()` from the spec under **The job**.

The checks call the first three on their own, with other values, then run a whole class through `main()`. So those three must **return** their answers, and only `main()` prints.

An empty list has no average, and `len([])` is 0, which Python won't divide by. Check for it first and return `None`. Then `main()` asks `is None` before it prints.

`sum(marks)` adds up a list of numbers, if you'd rather not write the loop.
