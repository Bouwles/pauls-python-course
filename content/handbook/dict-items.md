There are three ways to loop over a Python dictionary. A plain `for key in stock:` gives you the keys. `for item, count in stock.items():` gives you each key and its value together, which is what you want most of the time. `for count in stock.values():` gives only the values. Since Python 3.7, dictionaries keep their keys in the order they were added, so every one of these loops goes through the entries in that order, not alphabetically and not at random.

## How it works

`.items()` hands over each entry as a pair, a tuple of key and value. Writing two names after `for` unpacks the pair, so each name gets one half.

```python
stock = {"flour": 3, "yeast": 2, "butter": 5}
for item in stock:
    print(item, stock[item])
print(sum(stock.values()))
for item, count in sorted(stock.items()):
    print(f"{item}: {count}")
```

```text
flour 3
yeast 2
butter 5
10
butter: 5
flour: 3
yeast: 2
```

The first loop gets only keys, so it looks each value up with `stock[item]`. That works, but `.items()` saves the extra lookup and reads more clearly. `.values()` is handy when the keys don't matter, as with the total here. The first loop follows the order the keys were added; wrapping `stock.items()` in `sorted()` puts the pairs in alphabetical order of key instead.

Changing a value inside the loop is fine. Adding or removing keys from the dictionary you are looping over is not:

```python
stock = {"flour": 3, "yeast": 0, "butter": 5}
for item in stock:
    if stock[item] == 0:
        del stock[item]
```

```text
Traceback (most recent call last):
  File "main.py", line 2, in <module>
    for item in stock:
                ^^^^^
RuntimeError: dictionary changed size during iteration
```

The `del` itself works, but the loop notices that the dictionary changed size and refuses to carry on. Loop over a copy of the keys instead, with `for item in list(stock):`, or build a new dictionary holding only the entries you want to keep.

## Common mistakes

- **Expecting the values.** A plain `for` loop over a dictionary gives the keys. Use `.values()` for the values on their own, or `.items()` for both.
- **Unpacking without `.items()`.** `for item, count in stock:` tries to split each key into two parts. With a key such as `"flour"` that fails with `ValueError: too many values to unpack (expected 2)`, and with two-letter keys it quietly gives you single letters. Add `.items()`.
- **Expecting alphabetical order.** The loop goes in the order the keys were put in. For alphabetical order, loop over `sorted(stock)` or `sorted(stock.items())`.

## Related

[Dictionaries](/handbook/dictionaries) covers adding, replacing and removing keys. The pairs from `.items()` are [tuples](/handbook/tuples), split by [unpacking](/handbook/unpacking). To sort by value instead of key, see [sort keys](/handbook/sort-key), and for building a filtered dictionary in one line, see [dictionary comprehensions](/handbook/dict-set-comprehensions).
