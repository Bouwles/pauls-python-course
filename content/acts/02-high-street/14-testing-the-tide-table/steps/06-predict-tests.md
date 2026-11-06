---
id: predict-tests
type: predict
title: Tests that can't fail
concept: pytest
code: |
  def share(bill, people):
      return bill * people


  def test_share():
      share(1200, 4) == 300


  def test_same_twice():
      assert share(1200, 4) == share(1200, 4)


  test_share()
  test_same_twice()
  print("Both passed")
question: "`share` is wrong: it multiplies. What does this print?"
options:
  - text: Both passed
    correct: true
    feedback: "Neither test can fail. The first has no `assert`, so its comparison is worked out and thrown away. The second compares the code with itself. Each should have been `assert share(1200, 4) == 300`."
  - text: An AssertionError from test_share
    misconception: test-without-assert-checks
    error: AssertionError
    feedback: "Without `assert`, `share(1200, 4) == 300` is worked out to `False`, and nothing looks at it. Only `assert` can stop a test."
  - text: An AssertionError from test_same_twice
    misconception: expected-from-the-code
    error: AssertionError
    feedback: "Both sides call the same wrong code, so they always agree: 4800 equals 4800. The expected answer has to come from somewhere else, like your own sums."
---
Two tests for a share function that's broken on purpose.
