import csv
from pathlib import Path


def load_books(path):
    if not Path(path).exists():
        return []
    with open(path, newline="") as file:
        return list(csv.DictReader(file))


def by_author(books, author):
    titles = []
    for book in books:
        if book["author"] == author:
            titles.append(book["title"])
    return sorted(titles)
