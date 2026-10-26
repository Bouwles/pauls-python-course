import json

with open("questions.json") as file:
    questions = json.load(file)

local = [question["question"] if question["round"] == "Local" for question in questions]
for line in local:
    print(line)
