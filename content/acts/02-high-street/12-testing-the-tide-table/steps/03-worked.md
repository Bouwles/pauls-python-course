---
id: worked
type: worked
title: How Moss would do it
dialogue:
  - moss: "Bea's till, with its tests. Every repair should come with a way to check it."
code: |
  def price(item, quantity):
      """Price of an order in pence. Bread is 240; anything else is a bun at 85."""
      if item == "bread":
          return quantity * 240
      return quantity * 85


  def test_three_loaves():
      assert price("bread", 3) == 720


  def test_four_buns():
      assert price("bun", 4) == 340


  def test_nothing_ordered():
      assert price("bread", 0) == 0


  # A stand-in for pytest: run every test_ function and say how it went.
  if __name__ == "__main__":
      for name, test in list(globals().items()):
          if name.startswith("test_"):
              try:
                  test()
                  print("passed", name)
              except Exception as problem:
                  print("FAILED", name, type(problem).__name__, problem)
subgoals:
  - label: The code under test
    lines: [1, 5]
  - label: One behaviour per test, named for what it checks
    lines: [8, 9]
  - label: Work the answer out by hand, then assert it
    lines: [12, 13]
  - label: Cover the edges, not only the usual
    lines: [16, 17]
  - label: Run every test_ function (pytest does this part)
    lines: [20, 28]
explain:
  prompt: "Why does Moss work out 720 by hand, instead of writing `assert price(\"bread\", 3) == price(\"bread\", 3)`?"
  answer: "A test that compares the code with itself always passes, even when the code is wrong. The expected answer has to come from somewhere else: your own arithmetic, Bea's paper bag, Agnes's tide book."
  concept: assert
---
In a real project the tests live in their own file, `test_till.py`, which starts with `from till import price`. Here they share a file so you can see both at once.

The block at the bottom finds every function whose name starts with `test_`, calls it, and reports. You don't need to follow how yet: pytest does this part for you.
