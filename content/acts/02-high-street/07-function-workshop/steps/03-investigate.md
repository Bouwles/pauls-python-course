---
id: investigate
type: investigate
title: Any number of lines
concept: args-kwargs
code: |
  def label(*lines, border="*"):
      """Print a border, each line, then the border again."""
      print(border * 12)
      for line in lines:
          print(line)
      print(border * 12)


  label("Kettle", "Bea Hollis", "Spout rewelded")
tasks:
  - id: type-of-lines
    prompt: "Add `print(type(lines))` as the first line inside the function and run it. What type is `lines`?"
    kind: answer
    accept: ["tuple", "<class 'tuple'>", "a tuple"]
    feedback: "A tuple. The `*` in `*lines` gathers every positional argument into one tuple, however many there are."
    wrong: "Look for `<class '...'>` at the top of the output."
  - id: dashes
    prompt: "Change the call so the border is made of `-` instead of `*`."
    kind: run
    tests: |
      TESTS = [
          output("A dashed border", expect=r"^-{12}$", match="regex",
                 hint="After *lines, border can only be set by name, like border=\"-\"."),
      ]
    solution: |
      def label(*lines, border="*"):
          """Print a border, each line, then the border again."""
          print(border * 12)
          for line in lines:
              print(line)
          print(border * 12)


      label("Kettle", "Bea Hollis", "Spout rewelded", border="-")
  - id: positional-dash
    prompt: "Now try `label(\"Kettle\", \"-\")`. How many lines are printed between the two borders?"
    kind: answer
    accept: ["2", "two"]
    feedback: "Two: `Kettle` and `-`. Everything unnamed goes into `lines`. After `*lines`, `border` can only be set by name."
    wrong: "Count the lines between the two rows of stars."
  - id: notes
    prompt: "Change the `def` line to `def label(*lines, border=\"*\", **notes):`, add `print(type(notes))` inside, and call `label(\"Kettle\", spout=\"rewelded\")`. What type is `notes`?"
    kind: answer
    accept: ["dict", "<class 'dict'>", "a dict", "dictionary", "a dictionary"]
    feedback: "A dictionary. `**notes` gathers every keyword argument that matches no parameter: the names become keys, in the order they were given."
    wrong: "Look for `<class '...'>` in the output."
---
`*lines` in a `def` line gathers any number of positional arguments into one parameter. A label can have one line or six, and the function doesn't need to know which.

Work through the questions. Change anything you like; you can always reset.
