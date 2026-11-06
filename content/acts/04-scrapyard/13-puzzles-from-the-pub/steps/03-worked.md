---
id: worked
type: worked
title: How Paul seats the teams
dialogue:
  - caitlin.laughing: "Games night. Chess teams. The Rooks won't sit by the Knights since the last final."
  - caitlin.unimpressed: "The Bishops and the Pawns, don't ask."
  - paul.thinking.point: "Seat them one table at a time. When you're stuck, stand the last one up again."
code: |
  TEAMS = ["Rooks", "Knights", "Bishops", "Pawns"]
  RIVALS = {("Rooks", "Knights"), ("Bishops", "Pawns")}


  def rivals(one, other):
      return (one, other) in RIVALS or (other, one) in RIVALS


  def seat(row):
      if len(row) == len(TEAMS):
          return list(row)
      for team in TEAMS:
          if team in row:
              continue
          if row and rivals(row[-1], team):
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
  - label: "Seated already, or a rival of its neighbour: skip it"
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
Paul seats the chess teams at tables in a row, one table at a time, the same way. He never builds a whole seating only to find rivals at table one: the moment the Knights would sit by the Rooks, that way is dropped, and nothing that starts that way is tried.

The labels beside the code are the steps he took. Your `solve` takes the same steps with squares for tables and digits for teams, and they're in your file as comments. Press Step through and watch the tower of crates: one crate for each team seated so far.
