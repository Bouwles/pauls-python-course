---
id: make
type: make
title: Make the expense tracker
timeout_ms: 15000
on_pass: { yahya.pleased: "Requirement ten: anything else gets told. I typed my own name at it. It told me." }
hints:
  nudge: "What does the program have to remember from one choice to the next? Set that up before the loop starts."
  plan:
    - Decide what the program remembers
    - Add one expense
    - "The menu loop: ask, branch, go round again"
    - One function per job
    - The empty case
    - Try to break it
  shape: |
    def add_expense(expenses):
        item = input("What for? ").___()
        category = input("Category? ").___().___()
        try:
            amount = float(input("Amount? "))
        except ___:
            print("That's not an amount.")
            return
        if amount <= 0:
            ___
        expenses.append({"item": item, "category": ___, "amount": ___})
        print(f"Added {item}.")


    def category_totals(expenses):
        totals = {}
        for expense in expenses:
            ___
        return totals


    def biggest(expenses):
        if len(expenses) == 0:
            return ___
        largest = expenses[0]
        for expense in expenses:
            if expense["amount"] ___ largest["amount"]:
                largest = expense
        return largest


    def main():
        expenses = []
        while True:
            choice = input("1 add, 2 list, 3 totals, 4 biggest, 5 quit: ").strip()
            ___


    if __name__ == "__main__":
        main()
---
Build the expense tracker to Yahya's ten requirements in the brief. Paul's chalkboard is the plan. The file is empty apart from Yahya's note.

```
1 add, 2 list, 3 totals, 4 biggest, 5 quit: 3
food: 18.40
travel: 212.00
Total: 230.40
```

`category_totals` and `biggest` are checked on their own, with lists of receipts the checks make up. They return their answers, and the menu does the printing. `category_totals` works like the drinks count, and `biggest` like Neil's laps.

The checks then type whole afternoons at it: receipts added, refused, listed and totalled, and wrong numbers. When one fails, read its inputs. That's the afternoon Yahya had. Run it yourself first and try to break it.
