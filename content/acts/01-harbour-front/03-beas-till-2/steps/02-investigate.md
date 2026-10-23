---
id: investigate
type: investigate
title: What type is it?
concept: type-function
code: |
  count = input("How many? ")
  print(count * 2)
inputs: ["3"]
tasks:
  - id: type-of-count
    prompt: "Add `print(type(count))` on a new line and run it again. What type is `count`?"
    kind: answer
    accept: ["str", "<class 'str'>", "string", "a string", "text"]
    feedback: "`str`, short for string: text. `type()` tells you what kind of value something is."
  - id: make-it-a-number
    prompt: "Change line 1 so `count` holds a whole number. Run it with `3`: it should print `6`."
    kind: run
    tests: |
      TESTS = [
          output("Typing 3 gives 6", inputs=["3"], expect=r"^6$", match="regex",
                 hint="Wrap the input() in int( ) so the text becomes a whole number."),
          output("Typing 10 gives 20", inputs=["10"], expect=r"^20$", match="regex"),
      ]
    solution: |
      count = int(input("How many? "))
      print(count * 2)
---
`type(x)` tells you what kind of thing `x` is. The answer appears as `<class '...'>`.

`int()` turns text like `"3"` into the whole number `3`.
