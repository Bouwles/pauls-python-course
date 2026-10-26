"""Mrs Vance's library."""
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

    # Add behaviour as methods
    def lend(self, member: str) -> bool:
        """Lend the book to member. False if it's already out."""
        if self.status == Status.ON_LOAN:
            return False
        self.status = Status.ON_LOAN
        self.borrower = member
        return True

    def give_back(self) -> None:
        """Back on the shelf, with nobody's name against it."""
        self.status = Status.ON_SHELF
        self.borrower = None

    def __str__(self) -> str:
        return f"{self.title}, {self.author} ({self.year}): {self.status.value}"


# Say what kind of thing it is
class ReferenceBook(Book):
    """A book that never leaves the library."""

    # Change only what differs, reusing the parent's work
    def lend(self, member: str) -> bool:
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

    def __len__(self) -> int:
        return len(self.books)


if __name__ == "__main__":
    library = Library()
    library.add(Book("Emma", "Jane Austen", 1815))
    library.add(Book("The Riddle of the Sands", "Erskine Childers", 1903))
    library.add(ReferenceBook("Tide Tables 2026", "Agnes Rook", 2025))
    library.add(Book("emma", "Jane Austen", 1815))
    library.find("Emma").lend("Bea")
    print(f"The library has {len(library)} books")
    print(library.find("Emma"))
    print(library.find("tide tables 2026"))
    print("On the shelf: " + ", ".join(book.title for book in library.on_shelf()))
