---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Captain Ferro's season tickets. A little record for each passenger."
code: |
  # Captain Ferro's season tickets: a record for each passenger
  tickets = {
      "Mrs Vance": {"zone": "North Quay", "trips": 0},
      "Mr Okonjo": {"zone": "Harbour", "trips": 0},
  }

  name = input("Passenger? ")
  while name != "":
      record = tickets.get(name)
      if record is None:
          zone = input("Zone? ")
          tickets[name] = {"zone": zone, "trips": 1}
          print(f"New ticket for {name}.")
      else:
          record["trips"] = record["trips"] + 1
          print(f"{name}, {record['zone']}.")
      name = input("Passenger? ")

  for name, record in tickets.items():
      print(f"{name}: {record['trips']} trips")
inputs: ["Mrs Vance", "Nell Brannigan", "Scrapyard", "Mrs Vance", ""]
subgoals:
  - label: Keep a record for each name
    lines: [2, 5]
  - label: Ask until a blank line
    lines: [7, 8]
  - label: Look the name up
    lines: [9, 10]
  - label: Add what's missing
    lines: [11, 13]
  - label: Change the record inside
    lines: [15, 16]
  - label: Report every record
    lines: [19, 20]
explain:
  prompt: "Line 15 changes `record`. Why does that change what's in `tickets` as well?"
  answer: "`record` isn't a copy. It's a second label on the same inner dictionary that `tickets` holds, like the two labels on Bea's list. There's only one box to change."
  concept: nested-data
---
Each value in `tickets` is a dictionary of its own. `record['zone']` uses single quotes because the f-string already uses double ones.

`is None` is how you ask whether `.get()` found nothing.
