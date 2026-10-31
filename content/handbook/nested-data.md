Nested data is a Python dictionary or list whose values are themselves dictionaries or lists: a dictionary of customer records, a list of orders, a dictionary that maps each team to a list of names. Most real data has this shape, because each record has several parts and there are many records. JSON from a web service and rows read from a file usually arrive as a list of dicts or a dict of dicts. You reach inside with one pair of square brackets per level, read from the outside in.

## How it works

Each pair of brackets works on whatever the part to its left produced. A list takes a position number, a dictionary takes a key, and you can mix them in any order the data needs:

```python
deliveries = [
    {"name": "Emma", "parcels": 2},
    {"name": "Ivo", "parcels": 5},
]
teams = {"Red": ["Sam", "Ivo"], "Blue": ["Lena"]}

print(deliveries[1]["name"])
print(teams["Red"][0])
teams["Blue"].append("Omar")
print(teams)
for delivery in deliveries:
    print(delivery["name"], delivery["parcels"])
```

```text
Ivo
Sam
{'Red': ['Sam', 'Ivo'], 'Blue': ['Lena', 'Omar']}
Emma 2
Ivo 5
```

To read `deliveries[1]["name"]`, work left to right: `deliveries[1]` is Ivo's dictionary, and `["name"]` then looks inside that. `teams["Blue"]` is a list, so `.append()` adds to it in place, and the change shows when you print `teams`. Looping over a list of dicts hands you one whole dictionary per turn.

Getting an inner dictionary or list out never copies it. The name you put it in is a second label on the same object, so changing it through that name changes the outer data too. To get a separate one you have to ask for a copy, and how deep the copy goes matters:

```python
import copy

teams = {"Red": ["Sam", "Ivo"]}
shallow = teams.copy()
deep = copy.deepcopy(teams)
teams["Red"].append("Omar")
print(shallow["Red"])
print(deep["Red"])
```

```text
['Sam', 'Ivo', 'Omar']
['Sam', 'Ivo']
```

`.copy()` makes a new outer dictionary, but its values are the same inner lists as before, so the shallow copy sees Omar arrive. `copy.deepcopy()` copies every level, so nothing done to the original reaches it.

## Common mistakes

- **Expecting `record = book["Emma"]` to make a copy.** It doesn't: `record` and `book["Emma"]` are two names for one dictionary, and `record["parcels"] = 3` changes the book. Often that is what you want. If it isn't, use `book["Emma"].copy()`, or `copy.deepcopy()` when the record holds lists or dictionaries of its own.
- **Reaching an inner key from the outside.** With `book = {"Emma": {"address": "Mill Lane"}}`, the outer dictionary has one key, `"Emma"`. `book["address"]` is a `KeyError: 'address'`. Name every level on the way down: `book["Emma"]["address"]`.
- **Replacing a record when you meant to change one field.** `book["Ivo"] = book["Ivo"]["parcels"] + 1` swaps Ivo's whole record for a number. Put the full path on the left as well: `book["Ivo"]["parcels"] = book["Ivo"]["parcels"] + 1`.

## Related

Nested data is built from [dictionaries](/handbook/dictionaries) and [lists](/handbook/lists), and [looping over a dictionary](/handbook/dict-items) with `.items()` is the usual way through a dict of records. The second-label behaviour is explained in [references](/handbook/references) and [two labels, one list](/handbook/list-aliasing), and the difference between `.copy()` and `deepcopy()` in [shallow and deep copies](/handbook/copying). The [json module](/handbook/json-module) reads and writes data in exactly this shape.
