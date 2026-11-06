---
id: learn-type-hints
type: learn
title: Notes on what goes where
concept: type-hints
code: |
  def fine(days_late: int, pence_a_day: int = 10) -> int:
      """The fine for a late book, in pence."""
      return days_late * pence_a_day


  borrower: str | None = None
  print(fine(3))
  print(fine(4, 20))
  print(borrower)
---
A **type hint** is a note saying what type a value should be. `days_late: int` says the parameter should be a whole number, and `-> int` says what the function gives back. A dataclass's `title: str` is the same kind of note.

Hints make code easier to read, and editors use them to warn you about a mistake as you type.

Two more you'll need: `str | None` means a string or `None`, and `list[Book]` means a list of books. The example prints `30`, `80`, then `None`.

The usual slip is to think Python checks them when the program runs. It doesn't, and it doesn't convert anything either. A hint is a note for people and tools.
