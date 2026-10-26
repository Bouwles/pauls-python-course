---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "My job book. One repair a line, in whatever capitals I felt like that day."
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
A `Path` is a file name that knows things, such as whether the file `exists()`. `csv.writer` writes one row at a time and puts quotes round any value with a comma in it, like `clock, kitchen`. `newline=""` is what the `csv` module asks for when it opens a file.

Run it, then open `repairs.csv`. The radio has been in five times. It's Moss's.
