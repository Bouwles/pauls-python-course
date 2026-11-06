---
id: investigate-bisect
type: investigate
title: Where the bolts begin
concept: bisect
code: |
  import bisect

  parts = ["axle", "bolt-M10", "bolt-M12", "bolt-M8", "brake-pad", "chain", "gear-12t"]

  position = bisect.bisect_left(parts, "bolt-")
  print(position, parts[position])
tasks:
  - id: where-bolts-start
    prompt: "Run it. At what position would `bolt-` go?"
    kind: answer
    accept: ["1", "one", "position 1", "1 bolt-M10"]
    feedback: "1, right where the first bolt is. Every name that starts with `bolt-` comes straight after that place."
    wrong: "Read the number at the start of the line it prints."
  - id: collect-bolts
    prompt: "Collect the bolts. After the last line, make an empty list `bolts`. While `position < len(parts)` and `parts[position].startswith(\"bolt-\")`, append that name and add 1 to `position`. Then `print(bolts)`."
    kind: run
    tests: |
      TESTS = [
          output("Three bolts", expect="['bolt-M10', 'bolt-M12', 'bolt-M8']", match="last_line",
                 hint="The while loop needs both tests, joined with and: still inside the list, and the name still starts with bolt-."),
      ]
    solution: |
      import bisect

      parts = ["axle", "bolt-M10", "bolt-M12", "bolt-M8", "brake-pad", "chain", "gear-12t"]

      position = bisect.bisect_left(parts, "bolt-")
      print(position, parts[position])
      bolts = []
      while position < len(parts) and parts[position].startswith("bolt-"):
          bolts.append(parts[position])
          position = position + 1
      print(bolts)
  - id: stops-at-brake
    prompt: "Why does the loop stop at `brake-pad`, and never look at `chain` or `gear-12t`?"
    kind: answer
    accept: ["it doesn't start with bolt-", "doesn't start with bolt-", "doesn't start with bolt", "it doesn't start with bolt", "not a bolt", "it isn't a bolt", "startswith is false", "startswith is False", "it does not start with bolt-", "does not start with bolt", "brake-pad doesn't start with bolt-", "because brake-pad doesn't start with bolt-", "the name doesn't start with bolt-"]
    feedback: "`brake-pad` doesn't start with `bolt-`, and in a sorted list nothing after it can. So the loop only looks at the bolts and one name more, however long the list."
    wrong: "Look at the second test in the while line. What does it say about `brake-pad`?"
  - id: add-in-place
    prompt: "Neil buys a drum brake. At the end, add `drum-brake` in its place: `bisect_left` to find where it goes, then `parts.insert(...)` there, then `print(parts)`."
    kind: run
    tests: |
      TESTS = [
          output("drum-brake between chain and gear", expect="'chain', 'drum-brake', 'gear-12t'", match="contains",
                 hint="where = bisect.bisect_left(parts, \"drum-brake\"), then parts.insert(where, \"drum-brake\"), then print(parts)."),
      ]
    solution: |
      import bisect

      parts = ["axle", "bolt-M10", "bolt-M12", "bolt-M8", "brake-pad", "chain", "gear-12t"]

      position = bisect.bisect_left(parts, "bolt-")
      print(position, parts[position])
      bolts = []
      while position < len(parts) and parts[position].startswith("bolt-"):
          bolts.append(parts[position])
          position = position + 1
      print(bolts)

      where = bisect.bisect_left(parts, "drum-brake")
      parts.insert(where, "drum-brake")
      print(parts)
---
Your search engine needs two jobs from `bisect`: every name with a given beginning, and a new part put in its place. Both start from where a name would go.
