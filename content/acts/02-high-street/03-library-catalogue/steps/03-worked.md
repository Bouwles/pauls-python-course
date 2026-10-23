---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "My loans book. Which tools are out, and who has them. Kat has the small clamps."
code: |
  import csv
  from pathlib import Path

  LOANS = Path("loans.csv")
  FIELDS = ["tool", "borrower"]


  def load_loans(path):
      if not path.exists():
          return []
      with open(path, newline="") as file:
          return list(csv.DictReader(file))


  def save_loans(path, loans):
      with open(path, "w", newline="") as file:
          writer = csv.DictWriter(file, fieldnames=FIELDS)
          writer.writeheader()
          writer.writerows(loans)


  loans = load_loans(LOANS)
  loans.append({"tool": "spokeshave", "borrower": "Dev"})
  loans.append({"tool": "clamps, small", "borrower": "Kat"})
  save_loans(LOANS, loans)

  for loan in load_loans(LOANS):
      print(f"{loan['tool']}: {loan['borrower']}")
subgoals:
  - label: Name the file once, as a Path
    lines: [4, 5]
  - label: "No file yet: start with an empty list"
    lines: [9, 10]
  - label: Read the rows as dictionaries, inside with
    lines: [11, 12]
  - label: Write the header, then every row
    lines: [16, 19]
  - label: Load, change, save
    lines: [22, 25]
explain:
  prompt: "`save_loans` opens the file with `\"w\"`, which empties it first. Why doesn't Moss lose his old loans?"
  answer: "Because `loans` already holds everything that was in the file, plus the new ones. He loads it all, changes the list, then writes the whole list back."
  concept: files
---
`csv.DictReader` reads each row as a dictionary, using the header line for the keys. `csv.DictWriter` does the reverse, and puts quotes round any value with a comma in it, like `clamps, small`.

`newline=""` is what the `csv` module asks for when it opens a file. A `Path` is a file name that knows things, such as whether the file `exists()`.
