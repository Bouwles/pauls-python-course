---
id: predict-edit
type: predict
title: Kito and nite
concept: dynamic-programming
code: |
  def edit_table(given, correct):
      table = [[0] * (len(correct) + 1) for _ in range(len(given) + 1)]
      for row in range(len(given) + 1):
          table[row][0] = row
      for col in range(len(correct) + 1):
          table[0][col] = col
      for row in range(1, len(given) + 1):
          for col in range(1, len(correct) + 1):
              if given[row - 1] == correct[col - 1]:
                  table[row][col] = table[row - 1][col - 1]
              else:
                  table[row][col] = 1 + min(table[row - 1][col], table[row][col - 1], table[row - 1][col - 1])
      return table


  print(edit_table("kito", "quito")[-1][-1])
  print(edit_table("nite", "note")[-1][-1])
question: What does this print?
options:
  - text: |-
      2
      1
    correct: true
    feedback: "Right. Kito to quito swaps the k for a q and puts in a u: two changes. Nite to note swaps one letter."
  - text: |-
      1
      0
    misconception: edit-distance-is-length-gap
    feedback: "That's how much longer one word is than the other. Letters that differ count too: nite and note are the same length, but the i has to become an o."
  - text: |-
      3
      2
    misconception: edit-swap-is-two
    feedback: "A swap is one change, not a take-out and a put-in. The up-left slot is that swap, and it costs 1."
---
The table from the last step, on Yahya's answer and a word from the quiz. `[-1][-1]` is the bottom-right slot.
