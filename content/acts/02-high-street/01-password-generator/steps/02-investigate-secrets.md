---
id: investigate-secrets
type: investigate
title: Characters to choose from
concept: standard-library
code: |
  import secrets
  import string

  print(string.ascii_lowercase)
  print(string.digits)
  print(len(string.ascii_letters))

  letter = secrets.choice(string.ascii_uppercase)
  print(letter)
tasks:
  - id: how-many-letters
    prompt: "Run it. How many characters are in `string.ascii_letters`?"
    kind: answer
    accept: ["52", "fifty-two", "fifty two"]
    feedback: "52: the 26 small letters, then the 26 capitals."
    wrong: "It's the third line of the output."
  - id: same-letter
    prompt: "Run it two or three more times. Does the last line stay the same each time? Answer yes or no."
    kind: answer
    accept: ["no", "no it changes", "it changes", "no, it changes", "changes", "different", "no, it's different"]
    feedback: "No. `secrets.choice` picks one capital each run, and there's no way to know in advance which."
    wrong: "Look only at the last line, run after run."
  - id: six-digits
    prompt: "Replace the last two lines with a loop that builds a six-digit code, adding one `secrets.choice(string.digits)` each time round, then prints it."
    kind: run
    tests: |
      def six_digits(ctx):
          seen = set()
          for attempt in range(5):
              r = ctx.run_program()
              last = r.lines()[-1].strip() if r.lines() else ""
              if len(last) != 6 or not last.isdigit():
                  raise CheckFailed("The last line should be a code of six digits.", expected="six digits, like 408113", actual=last)
              seen.add(last)
          if len(seen) < 2:
              raise CheckFailed("Five runs gave the same code. Each run should pick new digits.", actual=last)

      TESTS = [custom("A six-digit code, new each run", six_digits,
                      hint="Start with code = \"\", then go round range(6), adding secrets.choice(string.digits) each time.")]
    solution: |
      import secrets
      import string

      print(string.ascii_lowercase)
      print(string.digits)
      print(len(string.ascii_letters))

      code = ""
      for _ in range(6):
          code += secrets.choice(string.digits)
      print(code)
---
Caitlin's passwords will be built from these characters. Run it and read each line of the output.
