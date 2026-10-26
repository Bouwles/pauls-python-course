---
id: investigate-gather
type: investigate
title: Any number of clerks
concept: args-kwargs
code: |
  def register(*names, length=12):
      """Print each name with the length of password it will get."""
      for name in names:
          print(name, length)


  register("Mira", "Pip", "Sanjay")
tasks:
  - id: type-of-names
    prompt: "Add `print(type(names))` as the first line inside the function and run it. What type is `names`?"
    kind: answer
    accept: ["tuple", "<class 'tuple'>", "a tuple"]
    feedback: "A tuple. The `*` in `*names` gathers every positional argument into one tuple, however many there are."
    wrong: "Look for `<class '...'>` at the top of the output."
  - id: longer
    prompt: "Change the call so all three clerks get passwords 16 characters long."
    kind: run
    tests: |
      TESTS = [
          output("Sixteen for everyone", expect="Mira 16\nPip 16\nSanjay 16", match="contains",
                 hint="After *names, length can only be set by name, like length=16."),
      ]
    solution: |
      def register(*names, length=12):
          """Print each name with the length of password it will get."""
          for name in names:
              print(name, length)


      register("Mira", "Pip", "Sanjay", length=16)
  - id: positional-sixteen
    prompt: "Now try `register(\"Mira\", 16)`. What is the second line it prints?"
    kind: answer
    accept: ["16 12"]
    feedback: "`16 12`. Everything unnamed goes into `names`, so 16 is treated as a clerk. After `*names`, `length` can only be set by name."
    wrong: "Copy the second line exactly, both numbers."
  - id: options
    prompt: "Change the `def` line to `def register(*names, length=12, **options):`, add `print(type(options))` inside, and call `register(\"Mira\", symbols=True)`. What type is `options`?"
    kind: answer
    accept: ["dict", "<class 'dict'>", "a dict", "dictionary", "a dictionary"]
    feedback: "A dictionary. `**options` gathers every keyword argument that matches no parameter: the names become keys, in the order they were given."
    wrong: "Look for `<class '...'>` in the output."
---
Mira has more than one clerk, and next week she may have more again. `*names` in a `def` line gathers any number of positional arguments into one parameter, so the function doesn't need to know how many.

The string in triple quotes under the `def` line is a **docstring**: it says what the function does. Work through the questions. You can always reset.
