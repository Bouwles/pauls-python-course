`append()` and `pop()` are the Python list methods for adding an item to the end of a list and taking one off. `parcels.append("Gwen")` puts `"Gwen"` at the end. `parcels.pop()` removes the last item and gives it back, so you can store it or use it straight away, and `parcels.pop(0)` does the same with the first item. They are how a list grows and shrinks while a program runs, and together they let a list work as a stack (last in, first out) or a queue (first in, first out).

## How it works

`append` adds exactly one item. Two close relatives cover the other cases: `extend` adds every item from another list, and `insert(i, x)` puts `x` at index `i` and moves the rest along.

```python
parcels = ["Bea", "Tom"]
result = parcels.append("Gwen")
print(result)
parcels.extend(["Mira", "Agnes"])
parcels.insert(0, "Moss")
print(parcels)
parcels.append(["Ida", "Ned"])
print(parcels)
```

```text
None
['Moss', 'Bea', 'Tom', 'Gwen', 'Mira', 'Agnes']
['Moss', 'Bea', 'Tom', 'Gwen', 'Mira', 'Agnes', ['Ida', 'Ned']]
```

`append` changes the list itself and gives back `None`, which is what `result` holds. Appending a list adds that whole list as a single item, so the last line ends with a list inside the list. `extend` is the one that adds the items separately.

`pop` is the reverse: it removes an item and hands it back.

```python
parcels = ["Bea", "Tom", "Agnes"]
last = parcels.pop()
first = parcels.pop(0)
print(last, first, parcels)
parcels.pop()
print(parcels)
parcels.pop()
```

```text
Agnes Bea ['Tom']
[]
Traceback (most recent call last):
  File "main.py", line 7, in <module>
    parcels.pop()
    ~~~~~~~~~~~^^
IndexError: pop from empty list
```

With no index, `pop` takes the last item. `pop(0)` takes the first, and every other item moves down one place, which is slow on very long lists. Popping from an empty list is an IndexError, so a loop that pops usually checks first: `while parcels:` keeps going only while there is something left.

## Common mistakes

- **Writing `parcels = parcels.append(x)`.** `append` changes the list in place and gives back `None`, so this line throws the list away and leaves `parcels` holding `None`. The next `parcels.append(...)` then fails with `AttributeError: 'NoneType' object has no attribute 'append'`. Call `parcels.append(x)` on a line of its own.
- **Expecting `pop()` to take the first item.** Without an index it takes the last one. Write `pop(0)` for the first.
- **Expecting `append` to add at the front.** It always adds at the end. To add at the front, use `parcels.insert(0, x)`.
- **Using `append` when you meant `extend`.** `parcels.append(["Ida", "Ned"])` adds one item, a list. To add Ida and Ned as two separate items, use `parcels.extend(["Ida", "Ned"])`.

## Related

[List methods](/handbook/list-methods) covers the rest, such as `remove` and `sort`. [Stacks](/handbook/stacks) are built from `append` and `pop()`, and [queues](/handbook/queues) take from the front, where a [deque](/handbook/deque) is faster than `pop(0)`. For why a method gives back `None`, see [None](/handbook/none).
