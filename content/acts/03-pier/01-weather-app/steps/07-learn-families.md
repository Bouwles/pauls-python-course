---
id: learn-families
type: learn
title: A family of errors
concept: exceptions
code: |
  def ask(problem):
      raise problem


  for problem in [FileNotFoundError("no saved reply"), TimeoutError("no answer in 10 seconds"),
                  ConnectionError("no connection")]:
      try:
          ask(problem)
      except OSError as error:
          print("Can't get the forecast:", error)
---
Errors come in families. `FileNotFoundError`, `TimeoutError` and `ConnectionError` are all subclasses of **`OSError`**, the way a reference book is a kind of book. A request that can't get through raises one too: on your own computer, `urllib` raises a `URLError`, another of the family.

So one `except OSError:` catches every member of the family, and covers every way the internet can let Riya down.

When a `try` has several `except` clauses, Python goes down them in order and takes the first that fits. The example catches all three problems with one `except` and prints a line for each.

The usual slip is to expect Python to pick the closest match. It takes the first that fits, so put the particular ones above the general ones.
