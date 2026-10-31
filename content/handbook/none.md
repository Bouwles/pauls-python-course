In Python, `None` is the value that means "nothing here": no result, no answer, not set yet. It is a real value with its own type, `NoneType`, and there is only one of it. You meet it most often by accident, as the result of a function that has no `return`, which is why a stray `None` turns up in output. You can also use it on purpose, as a starting value for something you don't know yet, like the best score before anyone has played. To test for it, write `if result is None:`.

## How it works

Plenty of Python's own tools give back `None` when their job is to change something rather than produce a value. Two common sources:

```python
scores = [3, 1, 2]
sort_result = scores.sort()
print(sort_result)
print(scores)

addresses = {"Emma": "Mill Lane"}
print(addresses.get("Ivo"))
```

```text
None
[1, 2, 3]
None
```

`.sort()` rearranges the list in place and returns `None`; the sorted list is `scores` itself. That is why `scores = scores.sort()` is a bug: it sorts the list, then replaces it with `None`. `.get()` returns `None` when the key isn't in the dictionary, where square brackets would raise a `KeyError`.

`None` is not zero and not empty text. It equals only itself, and arithmetic with it fails:

```python
best_time = None
print(best_time == 0, best_time == "")
print(best_time is None)
print(best_time + 1)
```

```text
False False
True
Traceback (most recent call last):
  File "main.py", line 4, in <module>
    print(best_time + 1)
          ~~~~~~~~~~^~~
TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'
```

`NoneType` in an error message is the clue that a `None` reached a place that needed a real value. Trace it back to where the variable was set, which is usually a function that didn't return.

Use `is None` rather than `== None`, which works but is not the usual style, and rather than `if not best_time:`. That last one treats `None`, `0` and `""` all as false, so a real time of 0 would look missing.

## Common mistakes

- **Expecting `print(None)` to print nothing.** It prints the word `None`. A blank line comes from `print()` with nothing in the brackets.
- **Thinking a function without `return` crashes when you use its result.** It doesn't: the call quietly gives `None`, and nothing complains until something tries to use it as a number or text, often several lines later.
- **Treating `None` as 0 or empty text.** `None == 0` is `False`, and `None + 1` is a `TypeError`. If you want a count to start at zero, start it at `0`; keep `None` for "no value yet" and check it with `is None`.
- **Printing inside a function instead of returning.** The printed value appears, then the caller's `print` adds `None` underneath, because the function returned nothing. Replace the inner `print` with `return`.

## Related

[Return values](/handbook/return-values) explains where `None` comes from, and [functions](/handbook/functions) shows the `print(ring_bell())` case. Using `None` as a "nothing yet" marker is a kind of [sentinel](/handbook/sentinels). [is and ==](/handbook/is-vs-equals) covers why `is` is the right test, and [.get()](/handbook/dict-get) covers dictionary lookups that might come back empty.
