Python variable names can contain letters, digits and underscores, but can't start with a digit, contain spaces or hyphens, or be a keyword such as `if` or `class`. They are case-sensitive, so `price` and `Price` are different variables. The PEP 8 style guide sets the convention, called snake_case: lower-case words joined by underscores, like `bread_price`. Within those rules, the best name says plainly what the value is.

## How it works

A name that breaks the rules is a [SyntaxError](/handbook/syntax-error). The message rarely says "bad name", because Python reads the line as something else:

```python
loaf-count = 3
```

```text
  File "main.py", line 1
    loaf-count = 3
    ^^^^^^^^^^
SyntaxError: cannot assign to expression here. Maybe you meant '==' instead of '='?
```

Python reads the hyphen as a minus sign, so the left side is the sum `loaf - count`, which can't be assigned to. `loaf count = 3` gives `invalid syntax`, and `2nd_delivery = 4` gives `invalid decimal literal`, because anything starting with a digit is read as a number.

Built-in function names such as `sum`, `list` and `str` aren't keywords, so Python lets you reuse them, hiding the function for the rest of the program:

```python
sum = 240 + 85
print(sum)
print(sum([240, 85]))
```

```text
325
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    print(sum([240, 85]))
          ~~~^^^^^^^^^^^
TypeError: 'int' object is not callable
```

"Not callable" means brackets were used on a value that isn't a function: `sum` is now 325.

Upper case marks a constant, a value set once and never changed, as in `VAT_RATE = 0.2`. Python doesn't enforce it; the capitals tell the reader.

An honest name also makes mistakes visible. Nothing looks wrong in `c = a * a`, but `cost = bun_price * bun_price` is plainly a price times a price. Add units where they help (`weight_kg`), name a list in the plural and one item in the singular (`parcels`, `parcel`), and make a true-or-false value read as a question (`is_open`). Single letters suit short code with a strong convention, such as `i` for a counter.

## Common mistakes

- **Putting a space or hyphen in a name, or starting it with a digit.** Join words with underscores, and spell out a leading number or move it to the end: `loaf_count`, `second_delivery`, `delivery_2`.
- **Changing the capitals between lines.** After `tide = 3`, `print(Tide)` stops with `NameError: name 'Tide' is not defined. Did you mean: 'tide'?`. Keep variable names in lower case.
- **Using a keyword as a name.** `class = "first"` is a SyntaxError. Python has 35 keywords; `import keyword` then `print(keyword.kwlist)` lists them. Use a fuller name, such as `ticket_class`.
- **Naming a variable after a built-in.** `sum`, `list` and `str` work as names at first, then cause the TypeError above. Name the value for what it is, such as `total`.

## Related

What a name actually does is covered in [variables](/handbook/variables). A misspelt name is the usual cause of a [NameError](/handbook/name-error), and a clear name often saves writing a [comment](/handbook/comments).
