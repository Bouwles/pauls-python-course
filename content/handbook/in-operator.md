The Python `in` operator checks whether a value is inside a collection and gives back `True` or `False`: `"Bea" in parcels` asks "is Bea one of the items in this list?". `not in` asks the opposite. It works on lists, tuples, sets, strings and dictionaries, and it is the usual way to write a membership test in an `if`, instead of a loop with a flag. What counts as "inside" depends on the type, and that difference catches people out.

## How it works

On a list, `in` compares the value with each item, using `==`, and the match has to be the whole item. On a string, it looks for a run of characters anywhere in the text. On a dictionary, it checks the keys.

```python
parcels = ["Bea", "Old Tom"]
print("Tom" in parcels)
print("Tom" in "Old Tom")
print("tom" in "Old Tom")
book = {"Bea": "Quay Row"}
print("Bea" in book, "Quay Row" in book)
print("Quay Row" in book.values())
```

```text
False
True
False
True False
True
```

`"Tom"` is not an item of `parcels`: the item is `"Old Tom"`, and the two are not equal. Tested against the string `"Old Tom"`, though, `"Tom"` is part of the text, so the answer is `True`. Capital letters count, which is why `"tom"` is not found. For a dictionary, `"Quay Row"` is a value, not a key, so `in` says `False` until you ask `book.values()` instead.

`in` answers whether. When you also need where, a list's `.index()` method gives the position:

```python
parcels = ["Bea", "Tom", "Agnes"]
name = "Gwen"
if name not in parcels:
    parcels.append(name)
print(parcels)
print(parcels.index("Agnes"))
```

```text
['Bea', 'Tom', 'Agnes', 'Gwen']
2
```

`.index()` raises a ValueError if the item is missing, so it is common to check with `in` first. Testing a list goes through the items one at a time, which is fine for short lists. For thousands of lookups, a set or a dictionary answers `in` much faster.

## Common mistakes

- **Expecting a list to match part of an item.** `"Tom" in ["Old Tom"]` is `False`, because a list compares whole items. To find items that contain some text, loop over the list and test each string: `if "Tom" in parcel:`.
- **Expecting a position.** `in` gives `True` or `False`, never an index. Use `parcels.index(x)` when you need to know where, after checking that `x` is there.
- **Expecting a dictionary to search its values.** `in` on a dictionary checks only the keys. Write `x in book.values()` to search the values.

## When to use it

`if fish in ["cod", "eel"]:` is a tidy replacement for `fish == "cod" or fish == "eel"`; see [and, or, not](/handbook/boolean-operators) for why `fish == "cod" or "eel"` always counts as true. For speed with large collections, see [membership speed](/handbook/membership-speed). [Looping over a list](/handbook/looping-lists) is the tool when you need each matching item, not only a yes or no.
