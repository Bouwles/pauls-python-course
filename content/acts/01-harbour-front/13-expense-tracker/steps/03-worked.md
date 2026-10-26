---
id: worked
type: worked
title: A menu that remembers
dialogue:
  - moss: "My job book. Every repair, who it was for, and how long it took. Bea's is the same shape with money."
code: |
  # Moss's job book: every repair, who it was for, and how long it took
  def add_job(jobs):
      customer = input("Who for? ").strip()
      try:
          hours = float(input("Hours? "))
      except ValueError:
          print("Hours are a number.")
          return
      jobs.append({"customer": customer, "hours": hours})


  def hours_by_customer(jobs):
      totals = {}
      for job in jobs:
          name = job["customer"]
          totals[name] = totals.get(name, 0) + job["hours"]
      return totals


  def main():
      jobs = []
      while True:
          choice = input("1 add, 2 hours, 3 stop: ").strip()
          if choice == "1":
              add_job(jobs)
          elif choice == "2":
              totals = hours_by_customer(jobs)
              for name in sorted(totals):
                  print(f"{name}: {totals[name]:.1f} hours")
          elif choice == "3":
              break
          else:
              print("1, 2 or 3.")


  if __name__ == "__main__":
      main()
inputs: ["1", "Bea", "2", "1", "Ferro", "1.5", "1", "Bea", "half", "1", "Bea", "0.5", "2", "3"]
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
  prompt: "Why does `add_job` take `jobs` as a parameter, instead of starting its own list?"
  answer: "A list made inside `add_job` would vanish when the function finished: that's scope. Passing `jobs` in gives the function a second label on `main()`'s list, so appending changes the one list `main()` keeps."
  concept: scope
---
`return` on line 8 leaves `add_job` early, so a bad number never reaches the list.

`totals.get(name, 0)` starts each customer from 0 the first time and adds to what's there every time after. `sorted(totals)` gives the names in alphabetical order.
