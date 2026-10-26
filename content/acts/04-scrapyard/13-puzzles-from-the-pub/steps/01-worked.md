---
id: worked
type: worked
title: How Moss seats the quiz teams
dialogue:
  - gwen: "The Committee won't sit by the Spanners since the tandem business. The Crusts and the Ledgers, don't ask."
  - moss: "Seat them one table at a time. When you're stuck, stand the last one up again."
code: |
  TEAMS = ["Committee", "Spanners", "Crusts", "Ledgers"]
  FEUDS = {("Committee", "Spanners"), ("Crusts", "Ledgers")}


  def feud(one, other):
      return (one, other) in FEUDS or (other, one) in FEUDS


  def seat(row):
      if len(row) == len(TEAMS):
          return list(row)
      for team in TEAMS:
          if team in row:
              continue
          if row and feud(row[-1], team):
              continue
          row.append(team)
          seating = seat(row)
          if seating:
              return seating
          row.pop()
      return None


  print(seat([]))
subgoals:
  - label: "Every table filled: that's a seating"
    lines: [10, 11]
  - label: Try each team in turn at the next table
    lines: [12, 12]
  - label: "Seated already, or feuding with its neighbour: skip it"
    lines: [13, 16]
  - label: Seat it, and carry on from the next table
    lines: [17, 18]
  - label: "It led to a seating: pass it back"
    lines: [19, 20]
  - label: "It didn't: stand it up again, and try the next"
    lines: [21, 21]
  - label: "Nobody fits here: go back a table"
    lines: [22, 22]
explain:
  prompt: "What would go wrong without `row.pop()`?"
  answer: "A team that led nowhere would stay in its seat. Every team tried after it would be added further along the row instead of in that seat, and the row would fill with teams that had already failed."
  concept: backtracking
---
This is **backtracking**: build an answer one choice at a time, check each choice as soon as it's made, and when there's nothing left that fits, undo the last choice and try the next one there.

Moss never builds a whole seating only to find a feud at table one. The moment the Spanners would sit by the Committee, that branch is dropped, and nothing that starts that way is ever tried.

Press Step through and watch Nell's junk tower: one crate for each team seated so far.
