A variable in Python is a name that refers to a value, so you can store something once and use it again by name. You make one with `=`, name on the left and value on the right: `bun_price = 85`. There is no separate declaration and no type to state; the first assignment creates the variable. Variables keep results for later, give numbers a meaning, and let you change a value in one place.

## How it works

Python works out the right side of the `=` first, then attaches the name on the left to the result, so a name can appear on both sides:

```python
crates = 12
print(crates)
crates = crates + 4
print(crates)
crates += 4
print(crates)
crates = "full"
print(crates)
```

```text
12
16
20
full
```

`crates = crates + 4` reads the old value, 12, adds 4, then moves the name to 16. `crates += 4` is shorthand for the same thing, and `-=`, `*=` and `/=` work alike. A name has no fixed type, so it can even move from a number to text.

A calculation uses the values its names hold at the moment it runs:

```python
price = 240
old_price = price
total = price * 3
price = 260
print(price, old_price, total)
```

```text
260 240 720
```

`old_price = price` attaches a second name to 240, so when `price` moves to 260, `old_price` stays put. `total` was worked out once, as 720. It isn't a formula like a spreadsheet cell, so it doesn't follow `price`; work it out again after the change.

Reading a name that no line has assigned yet is a [NameError](/handbook/name-error). Assigning to a misspelt name is quieter: `crate = crates + 4` makes a new variable and leaves `crates` at 12, with no error.

## Common mistakes

- **Expecting a variable to keep its first value.** After `crates = crates + 4`, the name refers to 16, not 12. Equally, `crates + 4` alone on a line works out 16 and throws it away; write `crates = crates + 4`.
- **Thinking `print(crates)` shows the word crates.** Without quotes, Python prints what the name holds. `print("crates")` prints the word.
- **Reading `=` as the equals of maths.** As an equation, `crates = crates + 4` is impossible. In Python it is an instruction, so the name must be on the left: `5 = crates` is a SyntaxError. To compare two values, use `==`, as in [comparisons](/handbook/comparisons).
- **Thinking `b = a` ties the names together.** `b` gets the value `a` holds now, and moving `a` later leaves `b` alone. Lists need care: a list changed in place, with `.append()` for example, shows the change through every name. See [list aliasing](/handbook/list-aliasing).

## Related

Choosing names is covered in [honest names](/handbook/naming), and the order lines run in under [program order](/handbook/program-order). A [running total](/handbook/running-totals) is a variable updated on each pass of a loop.
