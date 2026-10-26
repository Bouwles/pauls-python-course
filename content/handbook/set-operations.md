Python sets can be compared in a single expression: which values are in both, which are in either, which are in one but not the other. `found & reported` gives the intersection (in both), `found | reported` the union (in either), `found - reported` the difference (in the first but not the second) and `found ^ reported` the symmetric difference (in exactly one of the two). Each has a method form as well: `.intersection()`, `.union()`, `.difference()` and `.symmetric_difference()`. Together they replace the loops you would otherwise write to check every item of one list against another.

## How it works

Every operator builds a new set and leaves both originals as they were. Sets have no order, so this example sorts each result before printing it:

```python
found = {"umbrella", "glove", "scarf"}
reported = {"glove", "kite"}
print(sorted(found ^ reported))
print(sorted((found - reported) | (reported - found)))
print(sorted(found.intersection(["glove", "hat"])))
print(sorted(found.union(reported)))
print({"glove", "scarf"} <= found)
print(reported <= found)
```

```text
['kite', 'scarf', 'umbrella']
['kite', 'scarf', 'umbrella']
['glove']
['glove', 'kite', 'scarf', 'umbrella']
True
False
```

`^` keeps what is in one set or the other but not in both. The second line shows it is the same as joining the two differences: what only `found` has, plus what only `reported` has.

The methods do the same jobs as the operators, with one practical difference: a method accepts any collection as its argument, such as a list, while an operator insists on sets at both sides. `found & ["glove", "hat"]` is a TypeError (`unsupported operand type(s) for &: 'set' and 'list'`); `found.intersection(["glove", "hat"])` works.

`<=` asks whether every item on the left is also on the right, which is called a subset check. `>=` asks the reverse. `.issubset()` and `.issuperset()` are the method versions. Both answer True or False rather than building a set.

A way to remember the symbols: `&` means "in this one and in that one", which is why its result is never bigger than either set. `|` means "in this one or that one", which is why its result is never smaller.

## Common mistakes

- **Reading `&` as "everything from both".** `a & b` means "in `a` and also in `b`", so it keeps only the shared values. To get everything from both sets, use `a | b`.
- **Thinking `&` gives what's in `a` but not in `b`.** That is `a - b`. `&` keeps the overlap; `-` removes it.
- **Treating `-` as if order didn't matter.** `a - b` and `b - a` are different answers: the first is what only `a` has, the second what only `b` has. Neither one is "everything that isn't shared"; that is `a ^ b`.
- **Using the operators on lists.** `[1, 2] & [2, 3]` is a TypeError. Turn the lists into sets with `set()` first, or call a method on a set and pass the list to it.

## Related

All of these work on [sets](/handbook/sets). The symbols `&` and `|` are easy to confuse with the words `and` and `or`, which are [boolean operators](/handbook/boolean-operators) that combine True and False.
