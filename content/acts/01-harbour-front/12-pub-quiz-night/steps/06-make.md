---
id: make
type: make
title: Make Gwen's quiz
on_pass: { gwen: "It marked old tom wrong and nobody could argue. First time in eleven years." }
hints:
  nudge: "Which function needs to know about capitals and spaces, and which one only needs two numbers?"
  plan:
    - Name the job and what it needs
    - Work it out and hand it back
    - Keep the asking and printing in main()
    - Run main() when the file is run
  shape: |
    def is_correct(given, answer):
        return given.___().___() == answer.___()

    def verdict(score, total):
        if score == total:
            return "Full marks. Gwen is checking your sleeves."
        elif ___:
            return "Not one. Impressive, in its way."
        elif ___:
            return "Respectable."
        else:
            return "There's always next Tuesday."

    def main():
        score = 0
        for i in range(len(questions)):
            given = input(questions[i] + " ")
            if is_correct(___, ___):
                ___
            else:
                ___
        print(f"You scored {score} out of {len(questions)}.")
        print(___)
---
Write `is_correct`, `verdict` and `main()` from the spec. The questions are in the file already.

The checks call `is_correct` and `verdict` on their own, with other values, then run the whole quiz. So the functions must **return** their answers, and only `main()` prints.

Order matters in `verdict`: none right is also fewer than half.
