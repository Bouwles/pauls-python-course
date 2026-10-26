A ValueError in Python means a function got a value of the right type that it still couldn't use. The classic case is `int("seven")`: `int()` happily accepts text, but this text doesn't spell a number, so Python raises `ValueError: invalid literal for int() with base 10: 'seven'`. You meet it most often when converting what a user typed, and the fix is either to correct the value or to catch the error and ask again.

## How it works

The first line converts without trouble. The second gets the same type of value, a string, and fails because of what the string says:

```python
print(int("7"))
print(int("seven"))
```

```text
7
Traceback (most recent call last):
  File "main.py", line 2, in <module>
    print(int("seven"))
          ~~~^^^^^^^^^
ValueError: invalid literal for int() with base 10: 'seven'
```

The message repeats the value in quotes, exactly as received. That is often the whole clue: `''` means the user pressed Enter without typing, `'12.5'` means a decimal reached `int()`, and `'1,000'` means a comma got in.

Here the same function meets four different values. Three are strings and one is not:

```python
answers = ["12", "12.5", "", None]
for answer in answers:
    try:
        print(int(answer))
    except (TypeError, ValueError) as error:
        print(f"{type(error).__name__}: {error}")
```

```text
12
ValueError: invalid literal for int() with base 10: '12.5'
ValueError: invalid literal for int() with base 10: ''
TypeError: int() argument must be a string, a bytes-like object or a real number, not 'NoneType'
```

The two strings that fail give a ValueError, because some other string would have worked. `None` gives a TypeError, because no value of that type ever could.

ValueError turns up well beyond `int()`. `float("2,5")` raises one, so does `a, b = [1, 2, 3]` (`too many values to unpack (expected 2, got 3)`), and so does asking a list for the position of an item it doesn't contain with `.index()`.

## Common mistakes

- **Confusing ValueError with TypeError.** Ask: would a different value of the same type have worked? If yes, it's a ValueError: `int("seven")` fails, but `int("7")` is fine. If no value of that type could work, it's a [TypeError](/handbook/type-error): `"a" + 1` fails whatever number you use.
- **Thinking `int()` can read text like `"2.5"`.** It can't: decimal text is a ValueError. Read it with [float()](/handbook/float-conversion) instead, and use `int(float(text))` if you need a whole number.
- **Letting one bad answer stop the program.** People mistype. Put the conversion inside `try`, catch `ValueError` (only that, so real bugs still show), and ask again in a loop.

## Related

[int()](/handbook/int-conversion) explains what it can and can't read. Catching errors is covered in [try and except](/handbook/try-except), asking again until the answer is usable in [defensive input](/handbook/defensive-input), and the parts of an error message in [reading tracebacks](/handbook/reading-tracebacks).
