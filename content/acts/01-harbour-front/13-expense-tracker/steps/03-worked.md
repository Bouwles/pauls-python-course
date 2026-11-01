---
id: worked
type: worked
title: A menu that remembers
dialogue:
  - paul.thinking: "Neil's office-hours log: who came, and for how long. The trip fund is the same shape, with money."
code: |
  # Office hours: who came, and how long they stayed
  def add_visit(visits):
      student = input("Who? ").strip()
      try:
          hours = float(input("Hours? "))
      except ValueError:
          print("Hours are a number.")
          return
      visits.append({"student": student, "hours": hours})


  def hours_by_student(visits):
      totals = {}
      for visit in visits:
          name = visit["student"]
          totals[name] = totals.get(name, 0) + visit["hours"]
      return totals


  def main():
      visits = []
      while True:
          choice = input("1 add, 2 hours, 3 stop: ").strip()
          if choice == "1":
              add_visit(visits)
          elif choice == "2":
              totals = hours_by_student(visits)
              for name in sorted(totals):
                  print(f"{name}: {totals[name]:.1f} hours")
          elif choice == "3":
              break
          else:
              print("1, 2 or 3.")


  if __name__ == "__main__":
      main()
inputs: ["1", "Caitlin", "2", "1", "Yahya", "1.5", "1", "Caitlin", "half", "1", "Caitlin", "0.5", "2", "3"]
subgoals:
  - label: Ask for one record, and tidy it
    lines: [2, 3]
  - label: Refuse what can't be a number
    lines: [4, 8]
  - label: Add a dictionary to the list
    lines: [9, 9]
  - label: Add up by category with .get
    lines: [12, 17]
  - label: Set up what the program remembers, once
    lines: [21, 21]
  - label: One branch per option
    lines: [22, 31]
  - label: Catch everything else
    lines: [32, 33]
explain:
  prompt: "Why does `add_visit` take `visits` as a parameter, instead of starting its own list?"
  answer: "A list made inside `add_visit` would vanish when the function finished: that's scope. Passing `visits` in gives the function a second label on `main()`'s list, so appending changes the one list `main()` keeps."
  concept: scope
---
`return` on line 8 leaves `add_visit` early, so a bad number never reaches the list.

`totals.get(name, 0)` starts each student from 0 the first time and adds to what's there every time after. `sorted(totals)` gives the names in alphabetical order.
