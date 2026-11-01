"""The Studio's lending library."""
from dataclasses import dataclass
from enum import Enum


# List the choices
class Status(Enum):
    ON_SHELF = "on the shelf"
    ON_LOAN = "on loan"


# Describe one record, with types: not frozen, because a book goes out and comes back
@dataclass
class Book:
    """One book, and whether it's in."""

    title: str
    author: str
    year: int
    status: Status = Status.ON_SHELF
    borrower: str | None = None
    due: int | None = None

    # Add behaviour as methods
    def lend(self, member: str, today: int = 0) -> bool:
        """Lend the book to member, due back in 21 days. False if it's already out."""
        if self.status == Status.ON_LOAN:
            return False
        self.status = Status.ON_LOAN
        self.borrower = member
        self.due = today + 21
        return True

    def give_back(self) -> None:
        """Back on the shelf, with nobody's name against it."""
        self.status = Status.ON_SHELF
        self.borrower = None
        self.due = None

    def __str__(self) -> str:
        return f"{self.title}, {self.author} ({self.year}): {self.status.value}"


# Say what kind of thing it is
class ReferenceBook(Book):
    """A book that never leaves the library."""

    # Change only what differs, reusing the parent's work
    def lend(self, member: str, today: int = 0) -> bool:
        return False

    def __str__(self) -> str:
        return f"{super().__str__()}, reference only"


# Has a, not is a: the library keeps its books in a list
class Library:
    """Every book in the library, one card each."""

    def __init__(self) -> None:
        self.books: list[Book] = []

    def find(self, title: str) -> Book | None:
        """The book with this title, whatever its capitals, or None."""
        for book in self.books:
            if book.title.lower() == title.lower():
                return book
        return None

    def add(self, book: Book) -> bool:
        """Add a book, unless one with that title is already here."""
        if self.find(book.title) is not None:
            return False
        self.books.append(book)
        return True

    def on_shelf(self) -> list[Book]:
        """The books not on loan, in the order they were added."""
        return [book for book in self.books if book.status == Status.ON_SHELF]

    def overdue(self, today: int) -> list[Book]:
        """The books on loan whose due day has passed."""
        return [book for book in self.books if book.due is not None and book.due < today]

    def __len__(self) -> int:
        return len(self.books)


if __name__ == "__main__":
    library = Library()
    library.add(Book("Carrying the Fire", "Michael Collins", 1974))
    library.add(Book("The Mechanic's Tale", "Steve Matchett", 1999))
    library.add(ReferenceBook("House Style", "Paul", 2025))
    library.add(Book("carrying the fire", "Michael Collins", 1974))
    library.find("Carrying the Fire").lend("Aaesha")
    print(f"The library has {len(library)} books")
    print(library.find("Carrying the Fire"))
    print(library.find("house style"))
    print("On the shelf: " + ", ".join(book.title for book in library.on_shelf()))
