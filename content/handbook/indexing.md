Every item in a Python list has an index, a whole number giving its position, and the first index is 0, not 1. `parcels[0]` is the first item, `parcels[1]` the second, and in a list of four the last one is `parcels[3]`. You use an index to read one item, or to replace it with `parcels[1] = "Moss"`. Strings and tuples are indexed the same way. Starting from 0 is behind most off-by-one errors, and asking for an index that doesn't exist gives the error `IndexError: list index out of range`.

## How it works

Think of the index as the number of steps from the start of the list. The first item is zero steps away. The index can be any expression that gives a whole number, such as a variable or `i + 1`.

```python
parcels = ["Bea", "Tom", "Agnes", "Gwen"]
print(parcels[1])
print(parcels[1:2])
parcels[1] = "Moss"
print(parcels)
word = "harbour"
print(word[0])
```

```text
Tom
['Tom']
['Bea', 'Moss', 'Agnes', 'Gwen']
h
```

`parcels[1]` gives the item itself, the text `Tom`, with no brackets round it. A colon makes it a slice: `parcels[1:2]` is a new list holding that one item, which prints with brackets. Putting an indexed item on the left of `=` replaces what is in that position, and the rest of the list stays where it was. Indexing a string gives a single character. You can read a string's characters this way, but you can't assign to them, because strings can't be changed.

An index past the end is an error, not an empty result:

```python
parcels = ["Bea", "Tom", "Agnes"]
print(parcels[2])
print(parcels[3])
```

```text
Agnes
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    print(parcels[3])
          ~~~~~~~^^^
IndexError: list index out of range
```

The carets under the line point at the index that failed. A list of three has indexes 0, 1 and 2, so the largest valid index is always `len(parcels) - 1`.

## Common mistakes

- **Counting from 1.** The first item is `parcels[0]`. If you think "the third item", the index is 2. When a result is the item next to the one you expected, check this first.
- **Expecting a list back.** `parcels[1]` is the item itself: a string here, so you can call `.upper()` on it or compare it with `==`. Only a slice such as `parcels[1:2]` gives back a list.
- **Expecting `None` past the end.** Python doesn't quietly hand back nothing. A missing index stops the program with an IndexError, which is useful: it tells you the loop or calculation went one step too far. Check the length with `len()` first if the index might be too big.
- **Assigning to a new index to grow the list.** `parcels[3] = "Gwen"` on a three-item list fails with `IndexError: list assignment index out of range`. Indexing only reaches items that already exist. Add new ones with `parcels.append("Gwen")`.

## Related

[Negative indices](/handbook/negative-indices) count back from the end, so `parcels[-1]` is the last item. [Slicing](/handbook/slicing) takes several items at once, and [looping over a list](/handbook/looping-lists) shows how to visit each index in turn.
