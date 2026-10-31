"""The Studio's lending library."""
from dataclasses import dataclass
from enum import Enum


# List the choices: Status, ON_SHELF and ON_LOAN

# Describe one record, with types: Book, a dataclass, not frozen
# Add behaviour as methods: lend(member), give_back(), __str__

# Say what kind of thing it is: ReferenceBook
#   Change only what differs, reusing the parent's work

# Has a, not is a: Library keeps its books in a list
#   find(title), add(book), on_shelf(), __len__


if __name__ == "__main__":
    library = Library()
    library.add(Book("Emma", "Jane Austen", 1815))
    library.add(Book("The Riddle of the Sands", "Erskine Childers", 1903))
    library.add(ReferenceBook("House Style", "Paul", 2025))
    library.add(Book("emma", "Jane Austen", 1815))
    library.find("Emma").lend("Aaesha")
    print(f"The library has {len(library)} books")
    print(library.find("Emma"))
    print(library.find("house style"))
    print("On the shelf: " + ", ".join(book.title for book in library.on_shelf()))
