The `.get()` method looks a key up in a Python dictionary without crashing when the key isn't there. `book["Ivo"]` raises a KeyError if `"Ivo"` is not a key; `book.get("Ivo")` gives back `None` instead, and `book.get("Ivo", "No address")` gives back the default you chose. Use it wherever a missing key is an ordinary event rather than a bug: counting things, reading optional settings, or looking up a name a user typed.

## How it works

The most common use is counting. Each time an item turns up, its count is fetched with a default of 0, increased by one and stored again:

```python
orders = ["tea", "coffee", "tea", "juice", "tea"]
counts = {}
for drink in orders:
    counts[drink] = counts.get(drink, 0) + 1
print(counts)
print(counts.get("water", 0))
print(counts)
```

```text
{'tea': 3, 'coffee': 1, 'juice': 1}
0
{'tea': 3, 'coffee': 1, 'juice': 1}
```

The first time `"tea"` appears it isn't a key yet, so `.get()` gives 0 and the assignment stores 1. After that, `.get()` finds the stored count. It is the assignment that adds the key, not `.get()`: asking for `"water"` gives 0, and the dictionary printed afterwards has no water in it.

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
- **Thinking `.get()` stores the default.** `.get()` only reads. `counts.get("tea", 0)` on its own leaves `counts` unchanged. To store a value, assign it: `counts["tea"] = counts.get("tea", 0) + 1`.
- **Leaving out the default when counting.** `counts[drink] = counts.get(drink) + 1` fails the first time with `TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'`, because a missing key gives `None` and you can't add 1 to `None`. Pass 0 as the default.

## Related

[Dictionaries](/handbook/dictionaries) covers looking up, adding and replacing keys with square brackets. The value `.get()` returns by default is [None](/handbook/none), and counting with a dictionary is a kind of [running total](/handbook/running-totals).
