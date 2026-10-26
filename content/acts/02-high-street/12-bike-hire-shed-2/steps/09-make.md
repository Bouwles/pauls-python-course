---
id: make
type: make
title: Make the library
files: [library.py]
entry: library.py
on_pass: { vance: "One Emma. On loan to Bea. And the tide tables stay where Agnes can find them." }
hints:
  nudge: "Which of these is a kind of book, and which only has books?"
  plan:
    - List the choices
    - "Describe one record, with types: not frozen, because a book goes out and comes back"
    - Add behaviour as methods
    - Say what kind of thing it is
    - Change only what differs, reusing the parent's work
    - "Has a, not is a: a list of books inside the library"
  shape: |
    @dataclass
    class Book:
        title: str
        author: str
        year: int
        status: Status = ___
        borrower: str | None = ___

        def lend(self, member: str) -> bool:
            if self.status == ___:
                return False
            ...


    class ReferenceBook(___):
        def lend(self, member: str) -> bool:
            return False

        def __str__(self) -> str:
            return f"{___.__str__()}, reference only"


    class Library:
        def __init__(self) -> None:
            self.books: list[Book] = ___

        def on_shelf(self) -> list[Book]:
            return [book for book in self.books if ___]
---
Write the four pieces from the brief in `library.py`. The bottom of the file already uses them the way Mrs Vance will. The comments are Moss's subgoals, from Old Tom's lamp log and the cargo bike.

```
The library has 3 books
Emma, Jane Austen (1815): on loan
Tide Tables 2026, Agnes Rook (2025): on the shelf, reference only
On the shelf: The Riddle of the Sands, Tide Tables 2026
```

`str | None` is the type hint for "a string, or `None`". `list[Book]` is a list of books.

The checks lend books twice, try to borrow the tide tables, and add a second Emma in capitals.
