A comment in Python is a note for people reading the code. It starts with a hash sign, `#`, and runs to the end of the line. Python ignores it completely, so a comment has no effect on what the program does. You use comments to explain why the code is the way it is, and to switch a line off for a while without deleting it, which is called commenting it out.

## How it works

A comment can take a whole line, or sit at the end of a line of code after two spaces. Everything from the `#` onwards is skipped, so the code before it still runs.

```python
# Crate prices include a deposit, refunded when the crate comes back.
crate_price = 12
deposit = 3  # set by the supplier, not by us
# print("checking:", deposit)
print("Order #4 of the day")
print(crate_price + deposit)
```

```text
Order #4 of the day
15
```

Line 4 is code that has been commented out: it would print a checking message, but with a `#` in front it does nothing. Remove the `#` and it runs again. This is handy when you are hunting a bug and want to try the program without one line.

The `#` in `"Order #4 of the day"` does not start a comment, because it is inside a string. Python reads the quotes first, so a hash sign inside text is an ordinary character.

Python has no special syntax for a comment over several lines. Put a `#` at the start of each one; most editors do this for a selected block with a single shortcut (often Ctrl+/ or Cmd+/). You will sometimes see a triple-quoted string used as a long comment. That is a string Python creates and throws away, and at the top of a function it has a real job as a [docstring](/handbook/docstrings), so keep `#` for comments.

## Common mistakes

- **Thinking a line starting with `#` runs or prints.** It doesn't. Python skips everything from the `#` to the end of the line, so a comment never shows up in the output, even if it looks like code, as `# print("checking:", deposit)` does. If you want something on the screen, it needs a real `print()` with no `#` in front.
- **Writing comments that repeat the code.** `deposit = 3  # set deposit to 3` tells the reader nothing the code didn't. A useful comment answers a question the code can't: why 3, who decided, what breaks if it changes. And when you change the code, change the comment too. A comment that no longer matches is worse than none, because readers believe it.

## Related

Clear [names](/handbook/naming) often do the job of a comment: `deposit` needs less explaining than `d`. Python skips comments as it works through the [program order](/handbook/program-order), so a comment can't fix or break anything. To describe what a function does, use a [docstring](/handbook/docstrings) instead.
