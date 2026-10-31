An f-string is a Python string with the letter `f` in front of the opening quote. Inside it, anything in curly braces is worked out and dropped into the text, so you can write `f"{name} owes {total}"` instead of gluing pieces together with `+` and `str()`. The same braces also control how a value looks: two decimal places for money, commas in large numbers, padding to line up columns. f-strings have been the usual way to build text from values since Python 3.6, and most modern code uses them in preference to the older `.format()` and `%` styles.

## How it works

The braces can hold any expression, not just a variable name: arithmetic, a method call, an item from a list. Python works it out, turns the result into text and puts it in place.

```python
name = "Emma"
coffees = 3
price = 1.2
print(f"{name} bought {coffees} coffees for £{coffees * price:.2f}")
print(f"{name.upper()} owes {coffees * price}")
```

```text
Emma bought 3 coffees for £3.60
EMMA owes 3.5999999999999996
```

The second line shows why formatting matters. `3 * 1.2` is not exactly 3.6 as a float, and without instructions Python prints every digit it has. The part after the colon, `.2f`, means "fixed-point with two decimal places".

The format part has a small language of its own. A few pieces cover most needs:

```python
takings = 12345.678
share = 0.375
order = 7
item = "pens"
print(f"Takings: £{takings:,.2f}")
print(f"Share: {share:.1%}")
print(f"Order {order:03d}")
print(f"|{item:<8}|{order:>4}|")
print(f"{takings = }")
```

```text
Takings: £12,345.68
Share: 37.5%
Order 007
|pens    |   7|
takings = 12345.678
```

A comma adds thousands separators, `%` multiplies by 100 and adds a percent sign, `03d` pads a whole number with zeros to three digits, and `<8` or `>4` left- or right-aligns within that many characters. An `=` after the expression prints the expression itself as well as its value, which is handy when you are checking what a variable holds.

## Common mistakes

- **Leaving out the `f`.** Without it, the braces are ordinary characters: `print("Total: {total}")` prints `Total: {total}`. There is no error, so this one is easy to miss. Put the `f` directly before the opening quote.
- **Thinking `:.2f` changes the number.** Formatting only decides how the value is shown. The variable keeps every digit it had, and later sums use the full value. If you need a rounded number to calculate with, use `round(total, 2)`; for money, many programs store whole pence instead.
- **Wanting a literal brace.** To show `{` or `}` in an f-string, double it: `f"{{braces}}"` prints `{braces}`.

## Related

[str()](/handbook/str-conversion) is the other way to turn a value into text, and joining text to a number without either one is a [TypeError](/handbook/type-error). For why `3 * 1.2` prints so many digits, see [float()](/handbook/float-conversion).
