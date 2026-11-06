---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.laughing: "The Clocktower's repair book. One repair a line, in whatever capitals I felt like that day."
code: |
  import csv
  from collections import Counter
  from pathlib import Path

  JOB_BOOK = Path("jobs.txt")


  def read_repairs(path):
      """Every repair in the job book, one a line, tidied and in lower case."""
      repairs = []
      with open(path) as book:
          for line in book:
              repair = line.strip().lower()
              if repair:
                  repairs.append(repair)
      return repairs


  def save_tally(tally, path):
      """Write each repair and how often it came in, commonest first."""
      with open(path, "w", newline="") as file:
          writer = csv.writer(file)
          writer.writerow(["repair", "times"])
          for repair, times in tally.most_common():
              writer.writerow([repair, times])


  if not JOB_BOOK.exists():
      print("No job book on the bench.")
  else:
      tally = Counter(read_repairs(JOB_BOOK))
      for repair, times in tally.most_common(3):
          print(f"{repair}: {times}")
      save_tally(tally, "repairs.csv")
      print(f"{len(tally)} different repairs, saved in repairs.csv.")
subgoals:
  - label: Name the file once, as a Path
    lines: [5, 5]
  - label: Read inside with, a line at a time
    lines: [10, 12]
  - label: Tidy each piece, and skip the empty ones
    lines: [13, 15]
  - label: Write the header, then every row
    lines: [21, 25]
  - label: "No file: say so"
    lines: [28, 29]
  - label: Count with Counter
    lines: [31, 33]
  - label: Save, then say what was saved
    lines: [34, 35]
explain:
  prompt: "`save_tally` opens the file with `\"w\"` once, before the loop. What would happen if the `with open(...)` line were inside the loop instead?"
  answer: "Each time round, \"w\" would empty the file before writing one row, so only the last repair would be left in it."
  concept: files
---
Paul's repair book takes the same steps as Aaesha's counter, on a smaller file. The labels beside the code are the steps he took.

`if repair:` is true for any text except empty text, so the blank line is skipped. `most_common()` with nothing in the brackets gives every repair, commonest first.

Run it, then open `repairs.csv`. The radio has been in five times. The tower clock, once, a long time ago.
