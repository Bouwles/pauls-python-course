"""Sanjay's money, from the command line. The only file that prints or exits."""
import argparse
import sys
from datetime import date

from money import Ledger, MoneyError
from storage import load_ledger, save_ledger


def pence_from(text: str) -> int:
    """'-4.50' -> -450. argparse calls this, and a ValueError becomes a usage error."""
    return round(float(text) * 100)


def month_from(text: str) -> tuple[int, int]:
    """'2026-11' -> (2026, 11)."""
    year, month = text.split("-")
    if not 1 <= int(month) <= 12:
        raise ValueError(f"no month {month}")
    return int(year), int(month)


def money(pence: int) -> str:
    """-450 -> '-£4.50'."""
    sign = "-" if pence < 0 else ""
    return f"{sign}£{abs(pence) / 100:,.2f}"


def read_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sanjay's money: what came in, what went out.")
    parser.add_argument("--file", default="money.json", help="where the money is kept (default money.json)")
    commands = parser.add_subparsers(dest="command", required=True)
    adding = commands.add_parser("add", help="record money in or out")
    adding.add_argument("day", type=date.fromisoformat, help="like 2026-11-07")
    adding.add_argument("amount", type=pence_from, help="pounds: 1450 in, -4.50 out")
    adding.add_argument("category", help="food, fun, home, income, shop or travel")
    adding.add_argument("--note", default="", help="what it was")
    budget = commands.add_parser("budget", help="set a monthly budget")
    budget.add_argument("category")
    budget.add_argument("amount", type=pence_from, help="pounds a month")
    report = commands.add_parser("report", help="one month, by category")
    report.add_argument("month", type=month_from, help="like 2026-11")
    commands.add_parser("balance", help="everything in, less everything out")
    return parser.parse_args()


def print_report(ledger: Ledger, year: int, month: int) -> None:
    title = date(year, month, 1).strftime("%B %Y")
    transactions = ledger.in_month(year, month)
    if not transactions:
        print(f"Nothing in {title}.")
        return
    money_in = sum(t.pence for t in transactions if t.pence > 0)
    money_out = -sum(t.pence for t in transactions if t.pence < 0)
    print(title)
    print(f"Money in: {money(money_in)}")
    print(f"Money out: {money(money_out)}")
    over = ledger.over_budget(year, month)
    for category, spent in ledger.spending(year, month).items():
        line = f"{category}: {money(spent)}"
        if category in ledger.budgets:
            line += f" of {money(ledger.budgets[category])}"
        if category in over:
            line += f", over by {money(spent - ledger.budgets[category])}"
        print(line)
    print(f"Left over: {money(money_in - money_out)}")


def main() -> None:
    args = read_arguments()
    ledger = load_ledger(args.file)
    try:
        if args.command == "add":
            transaction = ledger.add(args.day, args.amount, args.category, args.note)
            if transaction.pence > 0:
                done = f"Paid in {money(transaction.pence)} on {transaction.day}."
            else:
                done = f"Spent {money(-transaction.pence)} on {transaction.category} on {transaction.day}."
        elif args.command == "budget":
            ledger.set_budget(args.category, args.amount)
            done = f"Budget for {args.category}: {money(args.amount)} a month."
        elif args.command == "report":
            print_report(ledger, *args.month)
            return
        else:
            print(f"Balance: {money(ledger.balance())}")
            return
    except MoneyError as refusal:
        print(refusal, file=sys.stderr)
        sys.exit(1)
    save_ledger(args.file, ledger)
    print(done)


if __name__ == "__main__":
    main()
