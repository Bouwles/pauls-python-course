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
Yahya and Caitlin have each written the start of Neil's library. Read both, then answer Paul's question.
