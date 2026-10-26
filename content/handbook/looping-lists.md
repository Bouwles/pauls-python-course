To loop over a list in Python, write `for parcel in parcels:`. The indented body then runs once for each item, from the first to the last, and each time `parcel` holds the current item. There is no counter to set up and no index to get wrong, which is why this is the usual way to process every item in a Python list: adding up prices, printing names, picking out the ones that match. When you need each item's position as well, `enumerate()` or `range(len(parcels))` gives you the index.

## How it works

The loop variable is a fresh name for each item in turn. It is not a link back into the list, which matters when you want to change the items:

```python
prices = [2.5, 1.2, 4.0]
for price in prices:
    price = price * 2
print(prices)
for i in range(len(prices)):
    prices[i] = prices[i] * 2
print(prices)
for number, price in enumerate(prices, start=1):
    print(f"{number}. £{price:.2f}")
```

```text
[2.5, 1.2, 4.0]
[5.0, 2.4, 8.0]
1. £5.00
2. £2.40
3. £8.00
```

The first loop doubles `price`, then throws the result away: it changes what the name `price` refers to, not what is stored in the list. The second loop goes through the indexes 0, 1 and 2 and assigns to `prices[i]`, which does change the list. `enumerate` hands over a number and an item together, and `start=1` makes the numbering begin at 1 for display.

Often you don't need to change the list at all. A loop can build up a total, or a new list, as it goes:

```python
weights = [2.5, 0.75, 4]
total = 0
heavy = []
for weight in weights:
    total = total + weight
    if weight > 2:
        heavy.append(weight)
print(total, heavy)
```

```text
7.25 [2.5, 4]
```

If `weights` were empty, the body would run zero times: `total` would stay 0 and `heavy` would stay `[]`, with no error. It is worth checking that your code gives a sensible answer in that case.

## Common mistakes

- **Expecting the indexes.** `for parcel in parcels:` gives the items themselves, `"Bea"`, `"Tom"` and so on, not 0, 1, 2. Writing `parcels[parcel]` inside it is a TypeError, because the item is not a number. If you want positions, loop over `enumerate(parcels)` or `range(len(parcels))`.
- **Assigning to the loop variable to change the list.** `price = price * 2` changes only the variable. Assign through the index with `prices[i] = ...`, or build a new list and use that.
- **Adding or removing items during the loop.** Removing an item while looping over the same list shifts the rest along, so the loop skips the item after it. Loop over a copy, `for parcel in parcels[:]:`, or build a new list of the items you want to keep.

## Related

[for loops](/handbook/for-loops) explains the loop itself, and [enumerate()](/handbook/enumerate) covers numbering in more detail. A loop that adds up as it goes is a [running total](/handbook/running-totals), and a [list comprehension](/handbook/list-comprehensions) builds a new list in one line.
