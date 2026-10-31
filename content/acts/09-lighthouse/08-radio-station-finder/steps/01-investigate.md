---
id: the-dial
type: investigate
title: Listening to the dial
dialogue:
  - paul: "Before you fix anything, listen to it."
code: |
  readings = [float(line) for line in open("dial.txt")]
  print(len(readings), "readings")

  loudest = max(range(len(readings)), key=lambda i: readings[i])
  print("loudest at", round(88.0 + loudest * 0.1, 1), "MHz:", readings[loudest])

  for i in range(loudest - 3, loudest + 4):
      print(round(88.0 + i * 0.1, 1), readings[i])
tasks:
  - id: loudest
    prompt: "Run it. At what frequency is the single loudest reading?"
    kind: answer
    accept: ["90.3", "90.3 MHz"]
    feedback: "90.3. One reading, far above the rest."
  - id: neighbours
    prompt: "Look at the readings either side of it. Is 90.3 a station, or a crackle? Answer station or crackle."
    kind: answer
    accept: ["crackle", "a crackle", "noise"]
    feedback: "A crackle. A real station is broad: it rises over several readings and falls again. This is one sharp reading with flat hiss on either side."
    wrong: "Compare 90.3 with 90.2 and 90.4. Does it rise gradually, or jump?"
---
The radio's auto-tune jumps to the loudest reading on the dial. That's why it lands on crackle.

Run the code and look at the loudest reading and its neighbours.
