---
id: investigate-gather
type: investigate
title: Any number of classmates
concept: args-kwargs
code: |
  def register(*names, length=12):
      """Print each name with the length of password it will get."""
      for name in names:
          print(name, length)


  register("Aaesha", "Caitlin", "Yahya")
tasks:
  - id: type-of-names
    prompt: "Add `print(type(names))` as the first line inside the function, under the docstring, and run it. What type is `names`?"
    kind: answer
    accept: ["tuple", "<class 'tuple'>", "a tuple"]
    feedback: "A tuple. The `*` in `*names` gathers every unnamed argument into one tuple, however many there are."
    wrong: "Look for `<class '...'>` at the top of the output."
  - id: longer
    prompt: "Change the call on the last line so all three classmates get passwords 16 characters long."
    kind: run
    tests: |
      TESTS = [
          output("Sixteen for everyone", expect="Aaesha 16\nCaitlin 16\nYahya 16", match="contains",
                 hint="After *names, length can only be set by name, like length=16."),
      ]
    solution: |
      def register(*names, length=12):
          """Print each name with the length of password it will get."""
          for name in names:
              print(name, length)


      register("Aaesha", "Caitlin", "Yahya", length=16)
  - id: options
    prompt: "Change the `def` line to `def register(*names, length=12, **options):`. Add `print(options)` inside, and change the call to `register(\"Aaesha\", symbols=True)`. What does `print(options)` show?"
    kind: answer
    accept: ["{'symbols': True}", "{'symbols':True}", "{\"symbols\": True}", "symbols: True"]
    feedback: "`{'symbols': True}`. `symbols` matches no parameter, so `**options` keeps it in a dictionary, the name as the key."
    wrong: "Copy the line with curly brackets exactly as it's printed."
---
`register` takes any number of classmates, and one option, `length`.
