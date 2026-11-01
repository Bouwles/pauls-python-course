---
id: worked
type: worked
title: How Paul would check it
dialogue:
  - paul.neutral.point: "The lending shelf downstairs. A model says who'll bring books back late, and those it names can't reserve the new ones."
  - aaesha.thinking: "Then before it names anyone, we see who it's wrong about."
code: |
  import numpy as np

  # The lending shelf's late-returns model, against what really happened
  group = np.array(["adult"] * 12 + ["junior"] * 8)
  late = np.array([0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0])
  flagged = np.array([0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1])

  print(f"Everyone: accuracy {np.mean(flagged == late):.2f}")

  for name in ["adult", "junior"]:
      mine = group == name
      accuracy = np.mean(flagged[mine] == late[mine])
      on_time = mine & (late == 0)
      wrongly = np.mean(flagged[on_time] == 1)
      print(f"{name:<7} accuracy {accuracy:.2f}, flagged though on time {wrongly:.2f}")
subgoals:
  - label: The model's answers and the truth
    lines: [3, 6]
  - label: Score everyone together
    lines: [8, 8]
  - label: One group at a time
    lines: [10, 11]
  - label: Accuracy within the group
    lines: [12, 12]
  - label: The mistake that costs someone
    lines: [13, 15]
explain:
  prompt: "Overall, the model is right three times in four. Why isn't that enough for the lending shelf?"
  answer: "The juniors are fewer, so their mistakes hardly move the overall number. Split by group, the model is right about nearly every adult and wrongly flags two in three juniors who brought their books back on time, and it's those juniors who lose their reservations. A model can be accurate overall and unfair to the group it sees least."
  concept: model-bias
---
**Model bias** is a model doing worse for one group than another, usually a group it saw less of, or one whose pattern differs. One overall score hides it.

So score each group on its own. `group == name` is a mask of that group's rows. Then pick the mistake that costs someone something: here, being flagged when you did nothing wrong. Count it only among the people it could happen to, the ones who were on time.
