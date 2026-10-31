A string is how Python stores text: a name, a message, a line read from a file, whatever someone typed. You write one by putting the text between quotes, either single (`'fog'`) or double (`"fog"`). Python treats both the same, so pick one and use the other only when the text itself contains a quote. The type is called `str`, and strings come with a large set of tools for joining, searching, cutting up and tidying text.

## How it works

The quotes tell Python where the text starts and ends. They are not stored as part of it, which is why `len()` counts only the characters in between. When the text contains one kind of quote, wrap it in the other kind; when it contains both, put a backslash before the one that matches the outside quotes.

```python
shop = "Emma's café"
quote = 'Lena said "no"'
both = "Lena said \"it's shut\""
print(shop)
print(quote)
print(both)
print(len(shop))
print("sea" + "weed")
print("sea" + " " + "weed")
print("3" + "4")
print("ha" * 3)
```

```text
Emma's café
Lena said "no"
Lena said "it's shut"
11
seaweed
sea weed
34
hahaha
```

`+` puts two strings side by side, with nothing between them. If you want a space, it has to be in one of the strings. `"3" + "4"` gives `34` because those are text, not numbers: digits in quotes are characters like any others. `*` with a whole number repeats a string.

The backslash also writes characters you can't type straight into a line. `\n` is a newline, and `\\` is one real backslash. For text over several lines, triple quotes keep the line breaks as written:

```python
notice = """Closed Monday.
Open Tuesday."""
print(notice)
print("Line one\nLine two")
```

```text
Closed Monday.
Open Tuesday.
Line one
Line two
```

## Common mistakes

- **Expecting the quotes to print.** `print("Emma")` shows `Emma`. The quotes are part of the code, not part of the text. If you want quote marks in the output, put them inside: `'Lena said "no"'`.
- **Opening with one kind of quote and closing with the other.** `"Emma's café'` never ends, because Python is still looking for a closing `"`, and the program stops with `SyntaxError: unterminated string literal`. The same error comes from `'Emma's café'`, where the apostrophe closes the string early. Make both ends match, and choose the outside quotes so they differ from any quote inside.
- **Thinking `+` only works on numbers.** On two strings, `+` joins them. What it can't do is join a string to a number: `"Laps: " + 4` is a [TypeError](/handbook/type-error). Turn the number into text with [str()](/handbook/str-conversion) first, or use an [f-string](/handbook/f-strings).

## Related

Strings are printed with [print()](/handbook/print). To work with the text inside one, see [string methods](/handbook/string-methods) such as `.upper()` and `.replace()`, [indexing](/handbook/indexing) for single characters and [string slicing](/handbook/string-slicing) for pieces.
