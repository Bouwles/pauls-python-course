---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul: "My fog log, one reading an hour. The beacon should keep flashing a while after the fog lifts."
  - paul: "One neuron that remembers. Three numbers, chosen by hand."
code: |
  import numpy as np

  # Paul's fog log, one reading an hour: 1 for fog, 0 for clear
  fog = [0, 1, 1, 0, 0, 0, 1, 0]

  w_in, w_memory, bias = 1.5, 0.9, -0.3

  memory = 0.0
  memories = []
  for reading in fog:
      memory = np.tanh(w_in * reading + w_memory * memory + bias)
      memories.append(memory)

  for hour, (reading, memory) in enumerate(zip(fog, memories)):
      beacon = "beacon" if memory > 0.5 else ""
      print(f"hour {hour}: fog {reading}  memory {memory:5.2f}  {beacon}")
subgoals:
  - label: "The weights: one for the reading, one for the memory"
    lines: [6, 6]
  - label: Start with an empty memory
    lines: [8, 8]
  - label: "Each hour: mix the new reading with the memory, and squash"
    lines: [10, 11]
  - label: Keep every hidden state
    lines: [12, 12]
  - label: Read the answer off the memory
    lines: [14, 16]
explain:
  prompt: "What would happen if `w_memory` were 0?"
  answer: "The memory would be built from the current reading alone, so the network would forget each hour as soon as it passed. The beacon would stop the moment the fog cleared. The weight on the old memory is what makes it recurrent."
  concept: rnns
---
Run it. After two foggy hours, the beacon keeps flashing for an hour of clear air. After one foggy hour, it doesn't.

`tanh` squashes the memory into -1 to 1, so it can't grow without limit however long the fog lasts. Neil's tide network does the same with eight neurons: `w_memory` becomes an 8 by 8 matrix, `Wh`, so every neuron's memory feeds every other's.
