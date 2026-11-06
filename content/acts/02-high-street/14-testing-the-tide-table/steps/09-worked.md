---
id: worked
type: worked
title: How Paul would do it
dialogue:
  - paul.neutral.point: "Caitlin's bake sale till, with its tests. Every program should come with a way to check it."
code: |
  def price(item, quantity):
      """Price of an order in pence. Bread is 240; anything else is a bun at 85."""
      if quantity < 0:
          raise ValueError("Nobody orders fewer than no loaves.")
      if item == "bread":
          return quantity * 240
      return quantity * 85


  def test_three_loaves():
      assert price("bread", 3) == 720


  def test_four_buns():
      assert price("bun", 4) == 340


  def test_nothing_ordered():
      assert price("bread", 0) == 0


  def test_no_negative_orders():
      try:
          price("bread", -1)
      except ValueError:
          return
      assert False, "price should refuse a negative quantity"


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
    lines: [1, 7]
  - label: One behaviour per test, named for what it checks
    lines: [10, 11]
  - label: Work the answer out by hand, then assert it
    lines: [14, 15]
  - label: Cover the edges, not only the usual
    lines: [18, 19]
  - label: Expect the error, and fail if it doesn't come
    lines: [22, 27]
  - label: Run every test_ function (pytest does this part)
    lines: [30, 38]
explain:
  prompt: "Why does Paul work out 720 by hand, instead of writing `assert price(\"bread\", 3) == price(\"bread\", 3)`?"
  answer: "A test that compares the code with itself always passes, even when the code is wrong. The expected answer has to come from somewhere else: your own arithmetic, the price list, a receipt."
  concept: assert
---
Paul's till comes with its tests. In a real project they'd live in their own file, `test_till.py`, starting with `from till import price`. Here they share a file so you can see both at once.

The labels beside the code are the steps he took. The last block is a stand-in for pytest: it finds every `test_` function and runs it, as the bottom of `test_bank.py` will.
