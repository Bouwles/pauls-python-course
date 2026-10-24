"""Sanjay's reorder list, from stock.csv."""
from stock import read_stock, to_reorder


def main():
    try:
        rows, bad_lines = read_stock("stock.csv")
    except FileNotFoundError:
        print("No stock.csv today.")
        return
    if bad_lines:
        print("Skipped lines: " + ", ".join(str(number) for number in bad_lines))
    reorder = to_reorder(rows)
    with open("reorder.txt", "w") as file:
        for item in reorder:
            file.write(item + "\n")
    if reorder:
        print("Reorder: " + ", ".join(reorder))
    else:
        print("Reorder: nothing")


if __name__ == "__main__":
    main()
