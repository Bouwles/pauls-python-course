---
id: investigate
type: investigate
title: Taking stock
concept: lists
code: |
  parcels = ["Bea Hollis", "Old Tom", "Agnes Rook"]
  print(len(parcels))
  parcels.append("Gwen")
  print(parcels)
tasks:
  - id: length
    prompt: "Run it. What does `len(parcels)` give?"
    kind: answer
    accept: ["3", "three"]
    feedback: "3. `len` counts the items. Their indexes are 0, 1 and 2, so the last index is always one less than the length."
  - id: where-gwen
    prompt: "`append` puts Gwen's parcel on the end. What is its index?"
    kind: answer
    accept: ["3", "three", "hole 3", "index 3"]
    feedback: "3. It went in after Agnes Rook, at index 2."
  - id: too-far
    prompt: "Add `print(parcels[4])` at the end and run it. What kind of error is it?"
    kind: answer
    accept: ["IndexError", "IndexError: list index out of range", "index error"]
    feedback: "IndexError. Four parcels have indexes 0 to 3. There is no hole 4."
    wrong: "Read the last line of the traceback. The error's name is the first word."
  - id: pop
    prompt: "Swap that line for `print(parcels.pop())`. Whose parcel comes out?"
    kind: answer
    accept: ["Gwen", "Gwen's", "gwen's parcel"]
    feedback: "Gwen's. `pop()` with nothing in the brackets takes the last item out of the list and hands it back."
  - id: tom-collects
    prompt: "Reset the code. Add one line so Old Tom's parcel is taken out with `pop` and his index, before the list is printed."
    kind: run
    tests: |
      TESTS = [
          output("Old Tom collects", expect="['Bea Hollis', 'Agnes Rook', 'Gwen']", match="last_line",
                 hint="Old Tom is at index 1. parcels.pop(1) takes him out. Do it before the last print."),
      ]
    solution: |
      parcels = ["Bea Hollis", "Old Tom", "Agnes Rook"]
      print(len(parcels))
      parcels.append("Gwen")
      parcels.pop(1)
      print(parcels)
---
`len(parcels)` is how many items the list holds. `parcels.append(x)` puts `x` on the end.

`parcels.pop()` takes the last item off and hands it back. `parcels.pop(1)` takes out the item at index 1, and the ones after it move along to fill the gap.
