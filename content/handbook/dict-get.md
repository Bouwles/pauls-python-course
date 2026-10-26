The `.get()` method looks a key up in a Python dictionary without crashing when the key isn't there. `book["Tom"]` raises a KeyError if `"Tom"` is not a key; `book.get("Tom")` gives back `None` instead, and `book.get("Tom", "No address")` gives back the default you chose. Use it wherever a missing key is an ordinary event rather than a bug: counting things, reading optional settings, or looking up a name a user typed.

## How it works

The most common use is counting. Each time an item turns up, its count is fetched with a default of 0, increased by one and stored again:

```python
catch = ["cod", "eel", "cod", "crab", "cod"]
counts = {}
for fish in catch:
    counts[fish] = counts.get(fish, 0) + 1
print(counts)
print(counts.get("plaice", 0))
print(counts)
```

```text
{'cod': 3, 'eel': 1, 'crab': 1}
0
{'cod': 3, 'eel': 1, 'crab': 1}
```

The first time `"cod"` appears it isn't a key yet, so `.get()` gives 0 and the assignment stores 1. After that, `.get()` finds the stored count. It is the assignment that adds the key, not `.get()`: asking for `"plaice"` gives 0, and the dictionary printed afterwards has no plaice in it.

The default is used only when the key is missing. A key that is there always gives its stored value, even if that value is 0, empty text or `None`:

```python
stock = {"flour": 0, "yeast": 2}
print(stock.get("flour", "not stocked"))
print(stock.get("sugar", "not stocked"))
print(stock["sugar"])
```

```text
0
not stocked
Traceback (most recent call last):
  File "main.py", line 4, in <module>
    print(stock["sugar"])
          ~~~~~^^^^^^^^^
KeyError: 'sugar'
```

Flour is a key, so its 0 comes back, not the default. Sugar is not, so `.get()` hands back the default while square brackets crash. Both behaviours are useful. Square brackets suit keys that must be there, because a KeyError points straight at a typo or a missing entry. `.get()` suits keys that may or may not be there.

## Common mistakes

- **Expecting square brackets to give `None`.** `book[key]` never quietly returns nothing for a missing key: it raises a KeyError. Only `.get()` returns `None` or a default.
- **Thinking `.get()` stores the default.** `.get()` only reads. `counts.get("cod", 0)` on its own leaves `counts` unchanged. To store a value, assign it: `counts["cod"] = counts.get("cod", 0) + 1`.
- **Leaving out the default when counting.** `counts[fish] = counts.get(fish) + 1` fails the first time with `TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'`, because a missing key gives `None` and you can't add 1 to `None`. Pass 0 as the default.

## Related

[Dictionaries](/handbook/dictionaries) covers looking up, adding and replacing keys with square brackets. The value `.get()` returns by default is [None](/handbook/none), and counting with a dictionary is a kind of [running total](/handbook/running-totals).
