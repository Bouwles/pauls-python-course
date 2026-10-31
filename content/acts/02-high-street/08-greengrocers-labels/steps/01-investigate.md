---
id: investigate
type: investigate
title: The question book
concept: json-module
dialogue:
  - caitlin: "Sixteen questions, typed up from my sheet. I left out the ones under the coffee ring."
code: |
  import json

  with open("questions.json") as file:
      questions = json.load(file)

  print(type(questions))
  print(len(questions))
  print(questions[0])
tasks:
  - id: what-type
    prompt: "Run it. What type is `questions`, once `json.load` has read the file?"
    kind: answer
    accept: ["list", "<class 'list'>", "a list"]
    feedback: "A list. The file starts with `[`, so JSON gives a list: here, a list of dictionaries, one per question."
    wrong: "Look at the first line of the output."
  - id: first-answer
    prompt: "What is the answer to the first question?"
    kind: answer
    accept: ["3:14"]
    feedback: "3:14. Each question is a dictionary with a `round`, a `question`, an `answer`, and sometimes `also`: other answers Caitlin will accept."
    wrong: "Look for `answer` in the last line of the output."
  - id: no-also
    prompt: "Add `print(questions[8].get(\"also\", []))`. Question 9 is about gold. What does it print?"
    kind: answer
    accept: ["[]"]
    feedback: "`[]`. Not every question has an `also`, so `.get` with a default saves a `KeyError` on the gold question."
    wrong: "It's the last line of the output."
  - id: every-question
    prompt: "Print every question in the Sea round, one a line, using a loop and an `if`."
    kind: run
    tests: |
      TESTS = [
          output("The four sea questions", match="contains",
                 expect="What do you call a speed of one nautical mile an hour?\nHow many hearts does an octopus have?\nWhat is a baby seal called?\nWhat is the lowest point of the tide called?",
                 hint="for question in questions: then if question[\"round\"] == \"Sea\": print(question[\"question\"])."),
      ]
    solution: |
      import json

      with open("questions.json") as file:
          questions = json.load(file)

      print(type(questions))
      print(len(questions))
      print(questions[0])
      for question in questions:
          if question["round"] == "Sea":
              print(question["question"])
---
Caitlin's questions are in `questions.json`. **JSON** is text written like Python's lists and dictionaries, and almost every program that keeps data in a file, or sends it across the internet, speaks it.

`json.load(file)` reads JSON from an open file and hands back the lists and dictionaries it describes. `json.dump(value, file)` writes them back.
