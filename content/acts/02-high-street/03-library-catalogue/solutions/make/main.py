# Mrs Vance's donations box.
import csv
from pathlib import Path

FIELDS = ["title", "author", "year", "shelf"]


def load_books(path):
    if not Path(path).exists():
        return []
    with open(path, newline="") as file:
        return list(csv.DictReader(file))


def save_books(path, books):
    with open(path, "w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(books)


catalogue = load_books("catalogue.csv")
donations = load_books("donations.csv")

if len(donations) == 0:
    print("No donations today.")
else:
    # A set of titles: in on a set is quick, however big the library gets.
    titles = set()
    for book in catalogue:
        titles.add(book["title"])
    for book in donations:
        if book["title"] in titles:
            print(f"{book['title']} is already catalogued.")
        else:
            catalogue.append(book)
            titles.add(book["title"])
            print(f"Added: {book['title']}")
    save_books("catalogue.csv", catalogue)
    print(f"The catalogue has {len(catalogue)} books.")
