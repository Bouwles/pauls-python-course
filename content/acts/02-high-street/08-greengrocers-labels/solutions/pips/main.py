import json

with open("questions.json") as file:
    questions = json.load(file)

local = [question["question"] for question in questions if question["round"] == "Local"]
for line in local:
    print(line)
