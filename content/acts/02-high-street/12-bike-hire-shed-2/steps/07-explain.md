---
id: explain
type: explain
title: Kat's way
dialogue:
  - dev: "A library is a list of books. So Library inherits from list. Done."
  - kat: "A library has books in it. And a kettle, and Mrs Vance. Is it a kind of kettle?"
code: |
  # Dev's library: a kind of list
  class Library(list):
      pass


  # Kat's library: has a list
  class Library:
      def __init__(self):
          self.books = []

      def add(self, book):
          self.books.append(book)
prompt: "Dev's library is a kind of list. Kat's library has a list. Which would you rather hand to Mrs Vance, and why?"
answer: "Kat's. A library is not a kind of list, so Dev's would let anyone call `sort()`, `clear()` or `pop()` on it, and nothing would stop a second card for the same book. Kat's keeps the list inside and offers only what a library should do. Ask whether it is a kind of the other thing (inherit) or has one (compose). A reference book is a book; a library has books."
concept: composition
---
Kat's way is **composition**: build a thing out of the other things it has, kept in its attributes, rather than making it a kind of something.

Moss's rule of thumb: if "is a" sounds right, inherit. If "has a" sounds right, compose. When neither sounds right, you've probably named the class wrong.
