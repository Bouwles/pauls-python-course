A Python dictionary (`dict`) stores pairs of keys and values, so you can look a value up by a name instead of by its position: `prices["bread"]` instead of remembering that bread was item 0. Use a dictionary when each value has a natural label, such as addresses by name, prices by item or counts by word. Keys are usually strings or numbers, and the values can be anything, including lists and other dictionaries. Looking up a key stays fast however large the dictionary gets.

## How it works

Square brackets do the work. On the right of `=` they look a value up. On the left they store one: a new key is added, and an existing key gets its value replaced.

```python
prices = {"bread": 2.4, "bun": 0.85}
prices["scone"] = 1.1
prices["bread"] = 2.6
del prices["bun"]
print(prices)
print(len(prices), "bread" in prices)
stock = {}
stock["flour"] = 3
print(stock)
```

```text
{'bread': 2.6, 'scone': 1.1}
2 True
{'flour': 3}
```

Bread was already a key, so its price changed from 2.4 to 2.6 and it kept its place. `del` removes a key along with its value. `len()` counts the keys, and `in` checks whether a key is there. `{}` is an empty dictionary that you can fill one key at a time. A dictionary remembers the order its keys were added, so printing it or looping over it goes in that order.

Looking up a key that isn't there stops the program with a KeyError:

```python
prices = {"bread": 2.4, "bun": 0.85}
print(prices["bun"])
print(prices["Bun"])
```

```text
0.85
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    print(prices["Bun"])
          ~~~~~~^^^^^^^
KeyError: 'Bun'
```

Keys must match exactly, capital letters included, and the error message names the key it couldn't find. If a missing key is normal rather than a mistake, check with `in` first or use `.get()`.

## Common mistakes

- **Expecting a second value to be ignored or kept alongside the first.** Each key appears once. Giving an existing key a value replaces the old one, without any warning. To keep several values under one key, make the value a list: `orders["Bea"] = ["bread", "bun"]`, then `orders["Bea"].append("scone")`.
- **Looking up by position.** `prices[0]` doesn't give the first entry. It looks for the key `0`, and with no such key it raises `KeyError: 0`. Look up by key, or loop over the dictionary to visit the entries in order.
- **Expecting `in` to search the values.** `2.4 in prices` checks only the keys, so it is `False` even when bread costs 2.4. To search the values, write `2.4 in prices.values()`.

## Related

[.get()](/handbook/dict-get) looks up a key that might be missing without crashing, and [looping over a dictionary](/handbook/dict-items) covers `.items()` and `.values()`. Dictionaries that hold lists or other dictionaries are [nested data](/handbook/nested-data), and [hash maps](/handbook/hash-maps) explains why lookups are fast.
