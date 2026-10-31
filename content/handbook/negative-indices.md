A negative index in Python counts back from the end of a list instead of forward from the start. `guests[-1]` is the last item and `guests[-2]` is the second to last, however long the list is. That makes "the last one" easy to ask for without working out `len(guests) - 1`, and it keeps working when the list grows or shrinks. Negative indexes work the same way on strings and tuples, so `name[-1]` is the last character of a name.

## How it works

Python turns a negative index into an ordinary one by adding the length of the list. In a list of four, `-1` means index 3 and `-4` means index 0, the first item.

```python
guests = ["Emma", "Ivo", "Lena", "Rosa"]
print(guests[-1], guests[len(guests) - 1])
print(guests[-4])
guests.append("Sam")
print(guests[-1])
guests[-1] = "Omar"
print(guests)
print("python"[-1])
```

```text
Rosa Rosa
Emma
Sam
['Emma', 'Ivo', 'Lena', 'Rosa', 'Omar']
n
```

After the `append`, `guests[-1]` is the new last item, with no change to the code that asks for it. A negative index can also go on the left of `=` to replace an item, exactly as a positive one can.

The valid negative indexes run from `-1` down to minus the length. One step further is an error, and `-0` is the same number as `0`:

```python
guests = ["Emma", "Ivo", "Lena", "Rosa"]
print(guests[-0])
print(guests[-5])
```

```text
Emma
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    print(guests[-5])
          ~~~~~~^^^^
IndexError: list index out of range
```

There are only four items, so there is no fifth from the end. Counting from the front starts at 0; counting from the back starts at -1.

Negative numbers work in slices too: `guests[-3:]` gives the last three items as a new list.

## Common mistakes

- **Thinking a negative index is always an error.** It isn't. `guests[-1]` is one of the most common expressions in Python. Only an index further back than the start of the list, such as `-5` for a list of four, raises an IndexError.
- **Treating the last item as `-0`.** The last item is `-1`, and `-2` is second from the end. Since `-0` is plain 0, `guests[-0]` is the first item. A safe way to think of it: `guests[-n]` is the item `n` places from the end.
- **Asking for the last item of an empty list.** `guests[-1]` on `[]` is an IndexError, because there is no last item. If the list might be empty, check first with `if guests:`.

## Related

[Indexing](/handbook/indexing) explains the positive indexes that negative ones are measured against. [Slicing](/handbook/slicing) and [string slicing](/handbook/string-slicing) use negative numbers to take items from the end of a list or string.
