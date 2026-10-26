Python's `int()` function converts a value to an integer, a whole number. Its most common job is turning text into a number, so you can do arithmetic with something a user typed or a line read from a file: `int("42")` gives the number 42. Given a float, it drops everything after the decimal point, so `int(7.9)` is 7. It truncates; it does not round.

## How it works

`int()` reads text made of digits, with an optional `+` or `-` in front. Spaces and newlines around the digits are ignored, which helps with text from files. Given a float, it cuts off the fractional part, moving towards zero:

```python
print(int("42") + 1)
print(int("  7\n"))
print(int(7.9), int(-7.9))
print(round(7.9), round(-7.9))
print(int(float("4.5")))
```

```text
43
7
7 -7
8 -8
4
```

`int(-7.9)` is -7, not -8: the decimals are removed and the sign is kept. If you want the nearest whole number, use `round()` instead. The last line shows how to get a whole number from text that has a decimal point: read it with `float()` first, then pass the float to `int()`.

Text with a decimal point, a comma or any letters is not a whole number, and `int()` refuses it rather than guess:

```python
print(int("4.5"))
```

```text
Traceback (most recent call last):
  File "main.py", line 1, in <module>
    print(int("4.5"))
          ~~~^^^^^^^
ValueError: invalid literal for int() with base 10: '4.5'
```

"Invalid literal" means the text doesn't spell a number, and "base 10" means `int()` was reading ordinary decimal digits. (It can read other bases if you ask: `int("ff", 16)` is 255.) The message quotes the exact text it was given, which is the place to look for a stray space, a comma in `"1,000"` or an empty string from someone pressing Enter.

## Common mistakes

- **Thinking `int()` rounds.** `int(7.9)` is 7, because `int()` throws the decimals away. Use `round(7.9)` for 8. Be aware that `round()` sends exact halves to the even neighbour, so `round(2.5)` is 2; the [float()](/handbook/float-conversion) page explains why.
- **Thinking `int()` can read text like `"2.5"`.** It can chop a float, but it can't read decimal text: `int("2.5")` is a [ValueError](/handbook/value-error). If the answer may have a decimal point, use `float()`. If you need a whole number from it, use `int(float(text))` to chop, or `round(float(text))` for the nearest.
- **Converting without keeping the result.** `int(count)` on a line of its own makes a number and throws it away; `count` is still text. Assign it: `count = int(count)`, or convert as you read, with `int(input("How many? "))`.

## Related

`int()` is most often paired with [input()](/handbook/input-returns-text), which always gives back text. For floor division and remainders on whole numbers, see [arithmetic](/handbook/arithmetic).
