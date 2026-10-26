Nested data is a Python dictionary or list whose values are themselves dictionaries or lists: a dictionary of customer records, a list of orders, a dictionary that maps each crew to a list of names. Most real data has this shape, because each record has several parts and there are many records. JSON from a web service and rows read from a file usually arrive as a list of dicts or a dict of dicts. You reach inside with one pair of square brackets per level, read from the outside in.

## How it works

Each pair of brackets works on whatever the part to its left produced. A list takes a position number, a dictionary takes a key, and you can mix them in any order the data needs:

```python
deliveries = [
    {"name": "Bea", "parcels": 2},
    {"name": "Tom", "parcels": 5},
]
crews = {"Kittiwake": ["Ferro", "Tom"], "Gannet": ["Nell"]}

print(deliveries[1]["name"])
print(crews["Kittiwake"][0])
crews["Gannet"].append("Pip")
print(crews)
for delivery in deliveries:
    print(delivery["name"], delivery["parcels"])
```

```text
Tom
Ferro
{'Kittiwake': ['Ferro', 'Tom'], 'Gannet': ['Nell', 'Pip']}
Bea 2
Tom 5
```

To read `deliveries[1]["name"]`, work left to right: `deliveries[1]` is Tom's dictionary, and `["name"]` then looks inside that. `crews["Gannet"]` is a list, so `.append()` adds to it in place, and the change shows when you print `crews`. Looping over a list of dicts hands you one whole dictionary per turn.

Getting an inner dictionary or list out never copies it. The name you put it in is a second label on the same object, so changing it through that name changes the outer data too. To get a separate one you have to ask for a copy, and how deep the copy goes matters:

```python
import copy

crews = {"Kittiwake": ["Ferro", "Tom"]}
shallow = crews.copy()
deep = copy.deepcopy(crews)
crews["Kittiwake"].append("Pip")
print(shallow["Kittiwake"])
print(deep["Kittiwake"])
```

```text
['Ferro', 'Tom', 'Pip']
['Ferro', 'Tom']
```

`.copy()` makes a new outer dictionary, but its values are the same inner lists as before, so the shallow copy sees Pip arrive. `copy.deepcopy()` copies every level, so nothing done to the original reaches it.

## Common mistakes

- **Expecting `record = book["Bea"]` to make a copy.** It doesn't: `record` and `book["Bea"]` are two names for one dictionary, and `record["parcels"] = 3` changes the book. Often that is what you want. If it isn't, use `book["Bea"].copy()`, or `copy.deepcopy()` when the record holds lists or dictionaries of its own.
- **Reaching an inner key from the outside.** With `book = {"Bea": {"address": "Quay Row"}}`, the outer dictionary has one key, `"Bea"`. `book["address"]` is a `KeyError: 'address'`. Name every level on the way down: `book["Bea"]["address"]`.
- **Replacing a record when you meant to change one field.** `book["Tom"] = book["Tom"]["parcels"] + 1` swaps Tom's whole record for a number. Put the full path on the left as well: `book["Tom"]["parcels"] = book["Tom"]["parcels"] + 1`.

## Related

Nested data is built from [dictionaries](/handbook/dictionaries) and [lists](/handbook/lists), and [looping over a dictionary](/handbook/dict-items) with `.items()` is the usual way through a dict of records. The second-label behaviour is explained in [references](/handbook/references) and [two labels, one list](/handbook/list-aliasing), and the difference between `.copy()` and `deepcopy()` in [shallow and deep copies](/handbook/copying). The [json module](/handbook/json-module) reads and writes data in exactly this shape.
