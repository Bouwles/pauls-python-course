---
id: predict-inheritance
type: predict
title: A kind of book
concept: inheritance
dialogue:
  - dev: "A new book is a book you only get for a week. So it's a kind of book. Watch."
code: |
  class Book:
      def __init__(self, title):
          self.title = title

      def describe(self):
          return f"{self.title}: {self.loan_days()} days"

      def loan_days(self):
          return 21


  class NewBook(Book):
      def loan_days(self):
          return 7


  latest = NewBook("Knots, Unexplained")
  print(latest.describe())
question: What does this print?
options:
  - text: "Knots, Unexplained: 7 days"
    correct: true
    feedback: "Right. `NewBook` gets `__init__` and `describe` from `Book`. Inside `describe`, `self` is the new book, so `self.loan_days()` finds the new book's own version."
  - text: "Knots, Unexplained: 21 days"
    misconception: parent-methods-call-parent-versions
    feedback: "`describe` is written in `Book`, but `self` is still the new book. Python looks for `loan_days` on the new book first."
  - text: An error, because NewBook has no __init__ or describe
    misconception: child-class-starts-empty
    error: AttributeError
    feedback: "The class in brackets is the parent. `NewBook` gets every method `Book` has, `__init__` included, unless it writes its own."
---
`class NewBook(Book):` makes a **subclass**: a new book is a kind of book. It **inherits** everything `Book` has and replaces only the methods it writes itself. Replacing one is called **overriding** it.

Mrs Vance has asked Dev and Kat to write her a program for the library. They have already started arguing.
