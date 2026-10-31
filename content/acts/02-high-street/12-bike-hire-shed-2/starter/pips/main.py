from dataclasses import dataclass
from enum import Enum


class Status(Enum):
    ON_SHELF = "on the shelf"
    ON_LOAN = "on loan"


@dataclass
class Book:
    title: str
    status: Status = Status.ON_SHELF


books = [
    Book("Emma", Status.ON_LOAN),
    Book("The Riddle of the Sands"),
    Book("Alice's Adventures in Wonderland", Status.ON_LOAN),
]

out = 0
for book in books:
    if book.status == "ON_LOAN":
        out += 1
print(out, "on loan")
