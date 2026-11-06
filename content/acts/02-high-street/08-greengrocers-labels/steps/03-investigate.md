---
id: investigate
type: investigate
title: The question book
concept: json-module
dialogue:
  - caitlin.pleased.point: "Sixteen questions, typed up from my sheet. I left out the ones under the coffee ring."
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
    prompt: "Add `print(questions[8].get(\"also\", []))` at the end and run it. Question 9 is about halloumi. What does it print?"
    kind: answer
    accept: ["[]"]
    feedback: "`[]`. Not every question has an `also`, so `.get` with a default saves a `KeyError` on the halloumi question."
    wrong: "It's the last line of the output."
  - id: every-question
    prompt: "Add a loop at the end that prints the text of every question in the Music round, one a line. Use an `if` on each question's `\"round\"`."
    kind: run
    tests: |
      TESTS = [
          output("The four music questions", match="contains",
                 expect="What do you call a group of four musicians?\nHow many strings does a standard guitar have?\nWhich instrument has 88 keys?\nWhat does a metronome keep?",
                 hint="for question in questions: then if question[\"round\"] == \"Music\": print(question[\"question\"])."),
      ]
    solution: |
      import json

      with open("questions.json") as file:
          questions = json.load(file)

      print(type(questions))
      print(len(questions))
      print(questions[0])
      for question in questions:
          if question["round"] == "Music":
              print(question["question"])
---
Caitlin's question book, read in with `json.load`. Run it and look at what comes back.
