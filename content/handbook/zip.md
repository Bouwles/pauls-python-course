`zip()` is the Python built-in for looping over two or more lists at the same time. `zip(names, chests)` hands over one pair per step: the first name with the first chest measurement, then the second with the second, and so on. Use it when lists line up by position, such as names and scores or items and prices, instead of looping over `range(len(names))` and indexing every list by hand.

## How it works

Each step gives a tuple holding one item from each list, all from the same position, and a `for` loop usually unpacks it straight into names. When one list is shorter, `zip()` stops as soon as it runs out, and says nothing about the leftovers. Zipping a list with itself shifted along by one gives each item paired with the next:

```python
names = ["Ferro", "Bea", "Tom"]
chests = [112, 96]
print(list(zip(names, chests)))

route = ["Quay", "Mill", "Church", "Pier"]
for here, there in zip(route, route[1:]):
    print(f"{here} to {there}")
```

```text
[('Ferro', 112), ('Bea', 96)]
Quay to Mill
Mill to Church
Church to Pier
```

Tom has vanished without a word. In the route, stopping early is exactly right: `route[1:]` is one item shorter, so four stops give three legs. When the lists are meant to be the same length, though, that silence hides a bug. Since Python 3.10 you can ask `zip()` to check, with `strict=True`:

```python
names = ["Ferro", "Bea", "Tom"]
chests = [112, 96]
for name, chest in zip(names, chests, strict=True):
    print(name, chest)
```

```text
Ferro 112
Bea 96
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    for name, chest in zip(names, chests, strict=True):
                       ~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^
ValueError: zip() argument 2 is shorter than argument 1
```

The complete pairs still come out first, because `zip()` only discovers the mismatch when it reaches the end of the shorter list.

## Common mistakes

- **Expecting an error when the lengths differ.** Plain `zip()` stops quietly at the shortest list. Check the lengths first, or pass `strict=True` so a mismatch raises a ValueError.
- **Expecting `zip()` to join one list onto the end of the other.** That is `names + chests`. `zip()` pairs items across, position by position, and gives back as many pairs as the shortest list has items.
- **Expecting each whole list in one tuple.** `zip(names, chests)` does not give `(names, chests)`. It gives `("Ferro", 112)`, then `("Bea", 96)`: one tuple per position, with one item from each list.
- **Expecting the neighbours trick to wrap round.** `zip(route, route[1:])` stops at the last stop and never pairs `"Pier"` with `"Quay"`. If the route is a circle, add the first stop to the end of the second list: `zip(route, route[1:] + route[:1])`.
- **Printing a zip directly.** `print(zip(names, chests))` shows something like `<zip object at 0x100af5940>`, because `zip()` makes its pairs one at a time as they are asked for. Wrap it in `list()` to see them. For the same reason, a zip can only be looped over once.

## Related

The pairs are taken apart by [unpacking](/handbook/unpacking). To pair items with their positions instead of with another list, use [enumerate()](/handbook/enumerate). `route[1:]` is a [slice](/handbook/slicing).
