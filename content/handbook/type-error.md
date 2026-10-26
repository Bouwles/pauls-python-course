A TypeError in Python means an operation was given a value of the wrong type: a number where text was needed, text where a number was needed, `None` where a real value was expected. The most common one is joining text and a number with `+`, which gives `TypeError: can only concatenate str (not "int") to str`. Python stops rather than guess what you meant, and the fix is to decide which type you wanted and convert to it.

## How it works

The last line of the traceback names the error and says which types met. Read it first.

```python
crates = 3
print("Crates: " + crates)
```

```text
Traceback (most recent call last):
  File "main.py", line 2, in <module>
    print("Crates: " + crates)
          ~~~~~~~~~~~^~~~~~~~
TypeError: can only concatenate str (not "int") to str
```

The `^` marks the `+` that failed. "Concatenate" means join, and the message says a `str` can only be joined to another `str`, not an `int`. Write it the other way round, `crates + " crates"`, and the wording changes to `unsupported operand type(s) for +: 'int' and 'str'`. Same problem: the two sides of `+` are different types.

The line that crashes isn't always where the mistake is. Here the bug is a missing `return`:

```python
def add_vat(price):
    total = price * 1.2

cost = add_vat(10)
print(cost + 5)
```

```text
Traceback (most recent call last):
  File "main.py", line 5, in <module>
    print(cost + 5)
          ~~~~~^~~
TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'
```

`NoneType` is the type of `None`, which is what a function gives back when it has no `return`. Whenever a TypeError mentions `NoneType`, look for where that value came from.

Other TypeErrors follow the same idea. `len(5)` gives `object of type 'int' has no len()`, and calling a function with too few arguments gives a message such as `greet() missing 1 required positional argument: 'name'`.

## Common mistakes

- **Expecting `+` to join text and a number by itself.** It never will. Decide what you meant. For text, convert the number with [str()](/handbook/str-conversion) or use an [f-string](/handbook/f-strings). For arithmetic, convert the text with `int()` or `float()`. Picking the wrong direction swaps the crash for a wrong answer: if `crates` holds the typed text `"3"`, then `crates + str(2)` gives `"32"`, not 5.
- **Thinking text times a number is an error.** `"ab" * 3` is allowed and gives `ababab`. The TypeError only comes with something other than a whole number: `"ab" * "3"` or `"ab" * 2.5` gives `can't multiply sequence by non-int`. That is why `input("How many? ") * 2` doesn't crash; it quietly repeats the text.
- **Mixing it up with ValueError.** A TypeError says the kind of value is wrong, so no value of that type would have worked. A [ValueError](/handbook/value-error) says the type was fine but this particular value wasn't, as with `int("seven")`.

## Related

For reading the rest of the error message, see [reading tracebacks](/handbook/reading-tracebacks). Missing values are covered under [None](/handbook/none) and [return values](/handbook/return-values).
