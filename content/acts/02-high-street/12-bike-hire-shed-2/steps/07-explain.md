---
id: explain
type: explain
title: Caitlin's way
dialogue:
  - yahya.proud: "A library is a list of books. So Library inherits from list. One line. Done."
  - caitlin.laughing: "The Studio has books in it. And a kettle, and Neil. Is it a kind of kettle?"
code: |
  # Yahya's library: a kind of list
  class Library(list):
      pass


  # Caitlin's library: has a list
  class Library:
      def __init__(self):
          self.books = []

      def add(self, book):
          self.books.append(book)
prompt: "Yahya's library is a kind of list. Caitlin's library has a list. Which would you rather hand to Neil, and why?"
answer: "Caitlin's. A library is not a kind of list, so Yahya's would let anyone call `sort()`, `clear()` or `pop()` on it, and nothing would stop a second card for the same book. Caitlin's keeps the list inside and offers only what a library should do. Ask whether it is a kind of the other thing (inherit) or has one (compose). A reference book is a book; a library has books."
concept: composition
---
Caitlin's way is **composition**: build a thing out of the other things it has, kept in its attributes, rather than making it a kind of something.

Paul's rule of thumb: if "is a" sounds right, inherit. If "has a" sounds right, compose. When neither sounds right, you've probably named the class wrong.
