---
id: make
type: make
title: Make the search engine
files: [parts_search.py]
entry: parts_search.py
on_pass: { nell: "Seven looks for the brass valve, out of a hundred and eighty-eight. I'd have bet my gloves against it." }
hints:
  nudge: "For `find_part`, what are the first and last places the name could be, before you've looked at anything? And for `starting_with`, where would the prefix itself go?"
  plan:
    - "find_part: Moss's search from Mrs Vance's cards, counting a look each time round"
    - "starting_with: bisect_left to where the prefix would go, then collect names while they start with it"
    - "containing: look at every name, count each look, keep the ones with the word in"
    - "add_part: bisect_left to its place; insert it there unless it's there already"
    - "search: + adds, a final * means a beginning, otherwise the whole name, then words anywhere"
  shape: |
    def find_part(parts, name):
        low = 0
        high = ___
        looks = 0
        while low ___ high:
            middle = (low + high) // 2
            looks = looks + 1
            if parts[middle] == name:
                return ___, looks
            if parts[middle] < name:
                low = ___
            else:
                high = ___
        return -1, looks


    def starting_with(parts, prefix):
        position = bisect.___(parts, prefix)
        found = []
        while position < ___ and parts[position].___(prefix):
            found.append(parts[position])
            position = position + 1
        return found
---
Write the five functions from the brief in `parts_search.py`. Penhallow's parts book loads itself, `how_many` writes `1 part` or `5 parts`, and the counter loop at the bottom is done.

```
Search? valve-brass
valve-brass: part 159, found in 7 looks
Search? bolt-M1*
bolt-M1*: 5 parts: bolt-M10, bolt-M10-brass, bolt-M12, bolt-M12-brass, bolt-M16
```

`find_part` is Moss's search from Mrs Vance's cards, with a count of looks. The others are a few lines each. `parts.insert(position, name)` puts a name in and moves the rest along.

The hidden checks look up every name in the book, try lists of one name and none, and hand your functions a list of a million names that counts every one they look at.
