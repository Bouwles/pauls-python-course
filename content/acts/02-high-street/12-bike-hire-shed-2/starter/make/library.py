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
    library.add(Book("Carrying the Fire", "Michael Collins", 1974))
    library.add(Book("The Mechanic's Tale", "Steve Matchett", 1999))
    library.add(ReferenceBook("House Style", "Paul", 2025))
    library.add(Book("carrying the fire", "Michael Collins", 1974))
    library.find("Carrying the Fire").lend("Aaesha")
    print(f"The library has {len(library)} books")
    print(library.find("Carrying the Fire"))
    print(library.find("house style"))
    print("On the shelf: " + ", ".join(book.title for book in library.on_shelf()))
