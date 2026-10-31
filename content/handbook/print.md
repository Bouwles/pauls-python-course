Python's `print()` function is how a program shows you something: a message, a number, the result of a sum, the value a variable holds right now. You put what you want to see inside the brackets and Python writes it out, then moves to a new line. It is usually the first function anyone learns, and it stays useful for good, because printing a value is the quickest way to check what a program is doing.

## How it works

`print()` takes any number of values separated by commas. It turns each one into text, puts a space between them and adds a newline at the end. Two optional settings change those defaults: `sep` is what goes between the values, and `end` is what goes after the last one.

```python
print("Trains", 2, "an hour")
print("Trains", 2, "an hour", sep="-")
print(3 + 4, "bikes", 2.5, True)
print("Loading", end="...")
print("done")
print()
print("End")
```

```text
Trains 2 an hour
Trains-2-an hour
7 bikes 2.5 True
Loading...done

End
```

The third line shows that `print()` works out each value before it shows anything: `3 + 4` arrives as `7`. Numbers, decimals and `True` need no quotes and no conversion, because `print()` turns them into text itself. In the fourth line, `end="..."` replaces the newline, so the next `print()` carries on along the same line. An empty `print()` prints nothing followed by a newline, which gives you a blank line.

Because `print()` already puts a space between values, adding your own gives you two:

```python
print("Total: ", 5)
print("Total:", 5)
```

```text
Total:  5
Total: 5
```

## Common mistakes

- **Expecting to see the code, or the quotes.** `print("Hello")` shows `Hello`. The brackets belong to the function call and the quotes mark where the text starts and ends; neither is part of the value. In the same way, `print(score)` shows what the variable `score` holds, while `print("score")` shows the word score. Quotes mean "this exact text"; no quotes mean "look this name up".
- **Expecting separate `print()` calls to share a line.** Each call finishes its own line. To keep going on the same line, pass `end=""` (or some other ending), or build the whole line first, for example with an f-string, and print it once.
- **Using what `print()` gives back.** `print()` shows a value; it does not hand one back. `result = print(5)` shows 5 and stores `None` in `result`. If a function needs to pass a value on to the rest of the program, it should `return` it instead.

## Related

What goes inside the quotes is a [string](/handbook/strings), and the neatest way to build a line out of text and values is an [f-string](/handbook/f-strings). Output appears in the order the lines run, as [program order](/handbook/program-order) explains. For printing versus giving a value back, see [return values](/handbook/return-values).
