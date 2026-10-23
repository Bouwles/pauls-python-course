import csv

FIELDS = ["title", "author", "year", "shelf"]


def add_book(path, book):
    with open(path, "w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writerow(book)


def count_books(path):
    with open(path, newline="") as file:
        return len(list(csv.DictReader(file)))


add_book("catalogue.csv", {"title": "Notes on Gulls", "author": "R. Pennant", "year": "1971", "shelf": "N1"})
print(count_books("catalogue.csv"), "books")
