# The end-of-term trip fund. Everyone paid in; this is where it goes out.
# Rule one of accounts: every penny that goes out is written down, or someone asks where it went.
# One list, one record per receipt, no copies. A.

MENU = "1 add, 2 list, 3 totals, 4 biggest, 5 quit: "
NONE_YET = "No expenses yet."


def add_expense(expenses):
    item = input("What for? ").strip()
    category = input("Category? ").strip().lower()
    try:
        amount = float(input("Amount? "))
    except ValueError:
        print("That's not an amount.")
        return
    if amount <= 0:
        print("That's not an amount.")
        return
    expenses.append({"item": item, "category": category, "amount": amount})
    print(f"Added {item}.")


def list_expenses(expenses):
    for expense in expenses:
        print(f"{expense['item']}: {expense['amount']:.2f} ({expense['category']})")


def total_of(expenses):
    total = 0
    for expense in expenses:
        total = total + expense["amount"]
    return total


def category_totals(expenses):
    totals = {}
    for expense in expenses:
        category = expense["category"]
        totals[category] = totals.get(category, 0) + expense["amount"]
    return totals


def show_totals(expenses):
    totals = category_totals(expenses)
    for category in sorted(totals):
        print(f"{category}: {totals[category]:.2f}")
    print(f"Total: {total_of(expenses):.2f}")


def biggest(expenses):
    if len(expenses) == 0:
        return None
    largest = expenses[0]
    for expense in expenses:
        # > rather than >=, so a tie goes to the receipt added first.
        if expense["amount"] > largest["amount"]:
            largest = expense
    return largest


def main():
    expenses = []
    while True:
        choice = input(MENU).strip()
        if choice == "1":
            add_expense(expenses)
        elif choice in ["2", "3", "4"] and len(expenses) == 0:
            print(NONE_YET)
        elif choice == "2":
            list_expenses(expenses)
        elif choice == "3":
            show_totals(expenses)
        elif choice == "4":
            top = biggest(expenses)
            print(f"Biggest: {top['item']}, {top['amount']:.2f} ({top['category']})")
        elif choice == "5":
            count = len(expenses)
            word = "expense" if count == 1 else "expenses"
            print(f"{count} {word}, {total_of(expenses):.2f} in all.")
            break
        else:
            print("Choose 1 to 5.")


if __name__ == "__main__":
    main()
