"""Sanjay's stock: reading the list, and working out what to order."""
import csv


def read_stock(path):
    """The rows that read, and the line numbers of the ones that don't."""
    rows = []
    bad_lines = []
    with open(path, newline="") as file:
        for line_number, row in enumerate(csv.DictReader(file), start=2):
            try:
                rows.append({"item": row["item"], "price": float(row["price"]), "count": int(row["count"])})
            except ValueError:
                bad_lines.append(line_number)
    return rows, bad_lines


def to_reorder(rows, below=10):
    """The items with fewer than below left, in alphabetical order."""
    return sorted([row["item"] for row in rows if row["count"] < below])


def price_book(rows):
    """Item to price, for the till."""
    return {row["item"]: row["price"] for row in rows}
