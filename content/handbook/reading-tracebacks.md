A traceback is the report Python prints when a program crashes. It looks alarming, but the layout never changes. Read a Python traceback from the bottom up. The last line gives the error type (`ZeroDivisionError`, `NameError`, `TypeError` and so on) and a message saying what went wrong. Above it is the route Python took to get there: one frame for each function call in progress, each with a line number and the line of code.

## How it works

Here one function calls another, and the second call to `report` crashes:

```python
def average(scores):
    return sum(scores) / len(scores)


def report(name, scores):
    print(f"{name}: {average(scores)}")


report("Emma", [7, 9])
report("Ivo", [])
```

```text
Emma: 8.0
Traceback (most recent call last):
  File "main.py", line 10, in <module>
    report("Ivo", [])
    ~~~~~~^^^^^^^^^^^
  File "main.py", line 6, in report
    print(f"{name}: {average(scores)}")
                     ~~~~~~~^^^^^^^^
  File "main.py", line 2, in average
    return sum(scores) / len(scores)
           ~~~~~~~~~~~~^~~~~~~~~~~~~
ZeroDivisionError: division by zero
```

Taking it from the bottom:

- `ZeroDivisionError: division by zero` is the error and its message. Python was asked to divide by zero.
- `File "main.py", line 2, in average` and the code under it say where: line 2, inside the function `average`. The `^` marks point at the operation that failed, the `/`, and the `~` marks underline the values on either side of it.
- The frame above, `line 6, in report`, is the line that called `average`.
- The top frame, `line 10, in <module>`, is the line that called `report`. `<module>` means the main part of the file, outside any function.
- `Traceback (most recent call last):` is the same every time. "Most recent call last" is why you read from the bottom: the frames are in the order the calls were made, so the place where the program stopped comes last.

`Emma: 8.0` above the traceback shows that the first call worked. Everything printed before a traceback ran normally.

The bottom frame says where the program broke, which is not always where the bug is. `average` is fine; it was handed an empty list. Reading upwards shows where that list came from: line 10. The fix could go in either place, and the traceback has shown you every line involved.

## Common mistakes

- **Starting at the top.** The first line never changes, and the top frame is the call furthest from the crash. Read the last line first, then the frame just above it, and work upwards only as far as you need to.
- **Assuming the error is on the first line.** The traceback names the exact line that failed. The lines before it ran, which is why their output is on the screen.
- **Skipping the message.** `division by zero` or `can only concatenate str (not "int") to str` usually tells you what the fix is before you look at any code.

## Related

Each error type has its own page: [SyntaxError](/handbook/syntax-error) (whose report is shorter, because nothing ran), [NameError](/handbook/name-error), [TypeError](/handbook/type-error) and [ValueError](/handbook/value-error). For why the frames pile up one per call, see [the call stack](/handbook/call-stack).
