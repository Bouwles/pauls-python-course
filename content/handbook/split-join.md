In Python, `split()` turns a string into a list of smaller strings, and `join()` turns a list of strings back into one string. `"cod eel bass".split()` gives `['cod', 'eel', 'bass']`, and `", ".join(names)` gives one line with a comma and a space between the names. Between them they cover most everyday text handling: breaking a sentence into words, reading the fields of a comma-separated line, tidying stray spaces, and building output such as `Bea, Mira, Gwen` from a list.

## How it works

With nothing in the brackets, `split()` breaks at any run of whitespace and ignores whitespace at the ends. Give it a separator and it breaks at exactly that text, every time it appears, and keeps everything else, spaces included:

```python
line = "Kittiwake, Mary Rose, Gull"
print(line.split(","))
print(line.split(", "))
print("a,,b".split(","))
entry = "2026-10-25 Gale warning from the north"
print(entry.split(maxsplit=1))
```

```text
['Kittiwake', ' Mary Rose', ' Gull']
['Kittiwake', 'Mary Rose', 'Gull']
['a', '', 'b']
['2026-10-25', 'Gale warning from the north']
```

Splitting at `","` leaves the space that followed each comma at the start of the next piece; splitting at `", "` removes it. Two separators in a row give an empty string between them. `maxsplit=1` stops after the first break, so the rest of the line stays in one piece, which suits a line that starts with a date or a command.

`join()` is called on the separator, and every item in the list must already be a string:

```python
counts = [3, 12, 7]
print("-".join(["high", "water"]))
print(", ".join([str(n) for n in counts]))
print(", ".join(counts))
```

```text
high-water
3, 12, 7
Traceback (most recent call last):
  File "main.py", line 4, in <module>
    print(", ".join(counts))
          ~~~~~~~~~^^^^^^^^
TypeError: sequence item 0: expected str instance, int found
```

The last line fails because `counts` holds whole numbers, and the error names the first item that isn't text. The line before it is the fix: turn each number into a string with `str()` first, then join.

## Common mistakes

- **Expecting `.split()` to keep the gaps.** With no argument, three spaces count as one break, so `"Lost   one oar".split()` gives three words, not empty pieces. Only an explicit separator counts every occurrence, as `"a,,b"` shows above.
- **Expecting a list back from `.join()`.** `" ".join(words)` gives one string. If you want a list, `.split()` is the method that makes one.
- **Calling join on the list.** `words.join(" ")` is an AttributeError: `'list' object has no attribute 'join'`. `join` belongs to the separator string: `" ".join(words)`. Reading it as "glue these words with a space" helps it stick.
- **Joining numbers.** `.join()` won't convert anything for you. Use `[str(n) for n in counts]`, as above.

## Related

[strip() and replace()](/handbook/strip-replace) tidy text before or after splitting, and [String methods](/handbook/string-methods) covers the rest of the toolkit. For files of comma-separated rows with quoted fields, the [csv module](/handbook/csv-module) handles the awkward cases that a plain `split(",")` gets wrong.
