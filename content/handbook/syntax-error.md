A SyntaxError means Python could not read your code. Before it runs anything, Python reads the whole file and checks it follows the rules of the language: brackets and quotes in pairs, a colon at the end of an `if` line, commas between items. If one line breaks those rules, Python stops with a `SyntaxError` and runs nothing at all, not even the lines above the mistake. The message names the line, and recent versions usually say what is missing.

## How it works

The first line here is fine, but it never runs:

```python
print("Checking the tide")
tide = 4
if tide > 3
    print("Sail")
```

```text
  File "main.py", line 3
    if tide > 3
               ^
SyntaxError: expected ':'
```

There is no `Checking the tide` in the output. Compare that with a crash such as a [NameError](/handbook/name-error), where every line before the bad one runs. The report has no `Traceback (most recent call last)` line, because no code was running. The `^` shows where Python was when it noticed the problem, here the end of the line, where the colon belongs.

A bracket that is opened and never closed is the most common cause. Python carries on reading the next line as part of the same statement, so the trouble often shows up later than the mistake. Python 3.14 points back to the bracket itself:

```python
print("Start")
fares = [4, 2, 3
total = sum(fares)
```

```text
  File "main.py", line 2
    fares = [4, 2, 3
            ^
SyntaxError: '[' was never closed
```

The `^` marks the opening `[`. The fix is a `]` at the end of that line. Other messages you will meet include `invalid syntax. Perhaps you forgot a comma?` for `print("Tide", 6 "metres")`, and `unterminated string literal` for a string with no closing quote. An `IndentationError`, such as `expected an indented block after 'if' statement on line 2`, is a kind of SyntaxError too.

## Common mistakes

- **Expecting the lines above to run.** Python checks the whole file before running any of it, so one SyntaxError, even on the last line, means no output at all.
- **Looking only at the line in the message.** That line is where Python noticed, and the mistake is sometimes just before it. Python 3.14 is good at pointing to the right place, but older versions (and some editors) report the line after an unclosed bracket. If the named line looks fine, check the end of the line above.
- **Mixing quote marks.** `print('Gulls")` opens with one kind of quote and tries to close with the other, so the string never ends. Use the same mark at both ends.
- **Using `=` to compare.** `if tide = 4:` gives `invalid syntax. Maybe you meant '==' or ':=' instead of '='?`. Comparing takes two equals signs.

## Related

[Reading a traceback](/handbook/reading-tracebacks) covers the longer report you get when code crashes while running. Comparing with `==` is covered under [comparisons](/handbook/comparisons), and the colon and indent rules under [if, elif and else](/handbook/if-elif-else).
