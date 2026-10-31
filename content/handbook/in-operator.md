The Python `in` operator checks whether a value is inside a collection and gives back `True` or `False`: `"Emma" in guests` asks "is Emma one of the items in this list?". `not in` asks the opposite. It works on lists, tuples, sets, strings and dictionaries, and it is the usual way to write a membership test in an `if`, instead of a loop with a flag. What counts as "inside" depends on the type, and that difference catches people out.

## How it works

On a list, `in` compares the value with each item, using `==`, and the match has to be the whole item. On a string, it looks for a run of characters anywhere in the text. On a dictionary, it checks the keys.

```python
guests = ["Emma", "Ann Lee"]
print("Ann" in guests)
print("Ann" in "Ann Lee")
print("ann" in "Ann Lee")
book = {"Emma": "Mill Lane"}
print("Emma" in book, "Mill Lane" in book)
print("Mill Lane" in book.values())
```

```text
False
True
False
True False
True
```

`"Ann"` is not an item of `guests`: the item is `"Ann Lee"`, and the two are not equal. Tested against the string `"Ann Lee"`, though, `"Ann"` is part of the text, so the answer is `True`. Capital letters count, which is why `"ann"` is not found. For a dictionary, `"Mill Lane"` is a value, not a key, so `in` says `False` until you ask `book.values()` instead.

`in` answers whether. When you also need where, a list's `.index()` method gives the position:

```python
guests = ["Emma", "Ann", "Lena"]
name = "Rosa"
if name not in guests:
    guests.append(name)
print(guests)
print(guests.index("Lena"))
```

```text
['Emma', 'Ann', 'Lena', 'Rosa']
2
```

`.index()` raises a ValueError if the item is missing, so it is common to check with `in` first. Testing a list goes through the items one at a time, which is fine for short lists. For thousands of lookups, a set or a dictionary answers `in` much faster.

## Common mistakes

- **Expecting a list to match part of an item.** `"Ann" in ["Ann Lee"]` is `False`, because a list compares whole items. To find items that contain some text, loop over the list and test each string: `if "Ann" in guest:`.
- **Expecting a position.** `in` gives `True` or `False`, never an index. Use `guests.index(x)` when you need to know where, after checking that `x` is there.
- **Expecting a dictionary to search its values.** `in` on a dictionary checks only the keys. Write `x in book.values()` to search the values.

## When to use it

`if drink in ["tea", "coffee"]:` is a tidy replacement for `drink == "tea" or drink == "coffee"`; see [and, or, not](/handbook/boolean-operators) for why `drink == "tea" or "coffee"` always counts as true. For speed with large collections, see [membership speed](/handbook/membership-speed). [Looping over a list](/handbook/looping-lists) is the tool when you need each matching item, not only a yes or no.
