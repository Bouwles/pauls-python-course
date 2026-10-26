An `if` statement lets a Python program make a decision: run some lines only when a test is `True`. `elif` (short for "else if") adds more tests to try in turn, and `else` catches everything the tests above didn't. Together they pick exactly one path through a set of choices, such as a fare band from an age or a warning from a wind speed. Each line ends with a colon, and the lines that belong to it are indented underneath.

## How it works

Python asks the tests from the top down and runs the first branch whose test is `True`. Once a branch has run, the rest are skipped, even if their tests would also be `True`. That makes order matter:

```python
wind = 30

if wind > 10:
    print("Breezy")
elif wind > 25:
    print("Gale")

if wind > 25:
    print("Gale")
elif wind > 10:
    print("Breezy")
```

```text
Breezy
Gale
```

Both chains have the same two tests. The first prints `Breezy` for a wind of 30 because `30 > 10` is checked first and is `True`, so the `Gale` branch is never reached. In fact it can never run, because any wind over 25 is also over 10. When the tests overlap, put the narrowest one first.

Separate `if` statements behave differently. Each one is a new decision, and they are all checked:

```python
wind = 30
if wind > 10:
    print("Breezy")
if wind > 25:
    print("Gale")
```

```text
Breezy
Gale
```

Use `elif` when the choices rule each other out and exactly one should happen. Use separate `if`s when several things can be true at once and each should get its response. You can have as many `elif`s as you need, and `else` is optional: without it, it is possible for no branch to run.

## Common mistakes

- **Expecting every true branch to run.** In an `if`/`elif` chain, only one branch runs: the first whose test is `True`. If you want every true test to act, use separate `if` statements.
- **Expecting Python to pick the best fit.** Python doesn't look for the most specific test. It takes the first that passes, so `if weight > 10` before `elif weight > 25` means the second branch can never run. Order the tests from narrowest to broadest.
- **Giving `else` a test.** `else age >= 16:` is a SyntaxError (`expected ':'`). `else` takes whatever is left and never has a test. If the last case needs its own condition, make it an `elif`.
- **Forgetting the colon or the indent.** Every `if`, `elif` and `else` line ends with `:`, and the lines under it are indented by four spaces. Python uses the indent to know where the branch ends.

## Related

The tests are usually [comparisons](/handbook/comparisons), joined with [and, or and not](/handbook/boolean-operators) when one test isn't enough. An `if` can also sit inside another; see [nested conditions](/handbook/nested-conditions).
