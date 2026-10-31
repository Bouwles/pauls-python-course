A Python list holds several values in one variable, in a fixed order, between square brackets: `guests = ["Emma", "Ivo", "Lena"]`. Use a list whenever you have a number of the same kind of thing (names, prices, readings) and want to keep them together, go through them one by one, or add and remove items as the program runs. Lists are the most used collection in Python, and most programs that handle more than a handful of values have one somewhere.

## How it works

A list can hold any values, including numbers, text and other lists. It keeps them in the order you wrote them, and the same value can appear more than once:

```python
guests = ["Emma", "Ivo", "Lena", "Ivo"]
weights = [2.5, 0.75, 4]
print(len(guests), len(weights), len([]))
print(guests)
print(weights)
print(["Emma", "Ivo"] == ["Ivo", "Emma"])
```

```text
4 3 0
['Emma', 'Ivo', 'Lena', 'Ivo']
[2.5, 0.75, 4]
False
```

`len()` counts every item, so the two Ivos count as two. `[]` is an empty list with a length of 0. Printing a whole list shows it the way you would type it into code, with brackets, commas and quotes round each piece of text. The quotes are not part of the names. To show the items as ordinary text, join them: `", ".join(guests)` gives `Emma, Ivo, Lena, Ivo`. Order matters, so two lists with the same items in a different order are not equal.

Each item has a position, called its index, which counts from 0. That is why the length is one more than the last index:

```python
guests = ["Emma", "Ivo", "Lena"]
print(guests[len(guests) - 1])
print(guests[len(guests)])
```

```text
Lena
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    print(guests[len(guests)])
          ~~~~~~^^^^^^^^^^^^^
IndexError: list index out of range
```

Three items sit at indexes 0, 1 and 2. Index 3 would be a fourth item, and there isn't one.

Unlike a string, a list can change after you make it: you can replace an item, add one to the end or take one off. Every name that refers to the list sees the change.

## Common mistakes

- **Treating `len()` as the last index.** `len(guests)` is how many items there are. The last item is at `len(guests) - 1`, and `guests[len(guests)]` is an IndexError. The neatest way to get the last item is `guests[-1]`, which works for a list of any length.
- **Calling a variable `list`.** It works at first, but it hides Python's own `list()` function for the rest of the program, and a later `list("abc")` then fails with a confusing TypeError. Pick a name that says what the list holds, such as `guests` or `prices`.

## Related

[Indexing](/handbook/indexing) and [negative indices](/handbook/negative-indices) get single items out. [append() and pop()](/handbook/append-pop) add and remove them, [looping over a list](/handbook/looping-lists) visits each one in turn, and [in](/handbook/in-operator) checks whether a value is there. When two names share one list, see [list aliasing](/handbook/list-aliasing).
